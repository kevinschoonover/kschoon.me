# Create group_vars/terraform.yml
import subprocess


def main():
    variables_from_terraform = ["redis_url", "postgres_fqdn"]
    output_variables = []
    procs = [
        (x, subprocess.Popen(["terraform", "output", x], stdout=subprocess.PIPE))
        for x in variables_from_terraform
    ]

    for variable, process in procs:
        output = process.communicate()[0].decode("utf-8").rstrip()
        assert (
            output
        ), "'{0}' was not output from terraform. Check if '{0}' is in an output in main.tf".format(
            variable
        )
        output_variables.append((variable, output))

    with open("./group_vars/terraform.yml", "w") as file_handle:
        file_handle.write("---\n")

        for variable, value in output_variables:
            file_handle.write("{}: {}\n".format(variable, value))


if __name__ == "__main__":
    main()
