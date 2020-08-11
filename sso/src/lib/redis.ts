import Redis from "ioredis"; // eslint-disable-line import/no-unresolved
import { AdapterPayload, Adapter, AdapterConstructor } from "oidc-provider";

import { config } from "../config";

const client = new Redis(config.REDIS_URL, {
  keyPrefix: "oidc:",
  lazyConnect: true,
});

const consumable = new Set(["AuthorizationCode", "RefreshToken", "DeviceCode"]);

function grantKeyFor(id: string) {
  return `grant:${id}`;
}

function userCodeKeyFor(userCode: string) {
  return `userCode:${userCode}`;
}

function uidKeyFor(uid: string) {
  return `uid:${uid}`;
}

export class RedisAdapter implements Adapter {
  constructor(public name: string) {
    this.name = name;
  }

  static new(name: string): Adapter {
    return new RedisAdapter(name);
  }

  async upsert(id: string, payload: AdapterPayload, expiresIn: number) {
    const key = this.key(id);
    const multi = client.multi();
    if (consumable.has(this.name)) {
      multi.hmset(key, { payload: JSON.stringify(payload) });
    } else {
      multi.set(key, JSON.stringify(payload));
    }

    if (expiresIn) {
      multi.expire(key, expiresIn);
    }

    if (payload.grantId) {
      const grantKey = grantKeyFor(payload.grantId);
      multi.rpush(grantKey, key);
      // if you're seeing grant key lists growing out of acceptable proportions consider using LTRIM
      // here to trim the list to an appropriate length
      const ttl = await client.ttl(grantKey);
      if (expiresIn > ttl) {
        multi.expire(grantKey, expiresIn);
      }
    }

    if (payload.userCode) {
      const userCodeKey = userCodeKeyFor(payload.userCode);
      multi.set(userCodeKey, id);
      multi.expire(userCodeKey, expiresIn);
    }

    if (payload.uid) {
      const uidKey = uidKeyFor(payload.uid);
      multi.set(uidKey, id);
      multi.expire(uidKey, expiresIn);
    }

    await multi.exec();
  }

  async find(id: string) {
    const data = consumable.has(this.name)
      ? await client.hgetall(this.key(id))
      : await client.get(this.key(id));

    if (!data) {
      return undefined;
    }

    if (typeof data === "string") {
      return JSON.parse(data);
    }
    const { payload, ...rest } = data;
    return {
      ...rest,
      ...JSON.parse(payload),
    };
  }

  async findByUid(uid: string) {
    const id = await client.get(uidKeyFor(uid));

    if (!id) {
      return undefined;
    }

    return this.find(id);
  }

  async findByUserCode(userCode: string) {
    const id = await client.get(userCodeKeyFor(userCode));

    if (!id) {
      return undefined;
    }

    return this.find(id);
  }

  async destroy(id: string) {
    const key = this.key(id);
    await client.del(key);
  }

  async revokeByGrantId(grantId: string) {
    // eslint-disable-line class-methods-use-this
    const multi = client.multi();
    const tokens = await client.lrange(grantKeyFor(grantId), 0, -1);
    tokens.forEach((token: string) => multi.del(token));
    multi.del(grantKeyFor(grantId));
    await multi.exec();
  }

  async consume(id: string) {
    await client.hset(this.key(id), "consumed", Math.floor(Date.now() / 1000));
  }

  key(id: string) {
    return `${this.name}:${id}`;
  }
}
