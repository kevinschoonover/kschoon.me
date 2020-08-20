# Create group_vars/terraform.yml
import subprocess
import json
import os


def main():
    process = subprocess.Popen(
        ["terraform", "output", "-json"], stdout=subprocess.PIPE, env=os.environ.copy()
    )
    output_json = process.communicate()[0].decode().rstrip()
    output_variables = []

    for output, data in json.loads(output_json).items():
        output_variables.append((output, data["value"]))

    with open("./group_vars/terraform.yml", "w") as file_handle:
        file_handle.write("---\n")

        for variable, value in output_variables:
            file_handle.write("{}: {}\n".format(variable, value))


if __name__ == "__main__":
    main()
