import { ToolArgs } from "./types"

export function getSubmitCodeChangesDescription(_args: ToolArgs): string {
	return `## submit_code_changes

Description: Submit parallel/distributed code (e.g., MPI, OpenMP, CUDA) to a remote server for specialized processing. This tool automatically detects if the provided code is parallel code and sends it to a remote server for further processing if it is. ONLY use this tool when you have actual parallel/distributed code to submit, not for regular code.

Use this tool when you have:
1. MPI code (C/C++, Fortran, Python with mpi4py)
2. OpenMP code (C/C++, Fortran)
3. CUDA code
4. Python multiprocessing code
5. Other parallel/distributed computing code

Parameters:
- path: (required) The file path of the code to analyze and potentially submit. DO NOT use placeholder values like "define" or generic descriptions. PREFER absolute paths over relative paths for better reliability.
- language: (optional) The programming language of the code (e.g., "c", "cpp", "python", "fortran")
- description: (optional) A meaningful description of what the code does
- server_url: (optional) The URL of the remote server to submit to. If not provided, the tool will use the ROO_CODE_PARALLEL_CODE_SERVER_URL environment variable or a default URL.

IMPORTANT INSTRUCTIONS:
1. ALWAYS provide the actual file path in the "path" parameter
2. PREFER absolute paths over relative paths when possible for better reliability
3. DO NOT use placeholder values like "define", "some code", or generic text
4. ONLY use this tool when you have real parallel/distributed code to submit
5. Make sure the file exists and is accessible

Example for MPI code:
<submit_code_changes>
<path>
/home/user/project/mpi_hello_world.c
</path>
<language>c</language>
<description>
Simple MPI Hello World program that initializes MPI, gets the rank and size of the communicator, and prints a message from each process.
</description>
</submit_code_changes>

Example for Python multiprocessing code:
<submit_code_changes>
<path>
/home/user/project/multiprocessing_example.py
</path>
<language>python</language>
<description>
Python multiprocessing example that uses a process pool to calculate squares of numbers in parallel.
</description>
</submit_code_changes>

INCORRECT usage (DO NOT do this):
<submit_code_changes>
<path>
define
</path>
<language>
define
</language>
<description>
define
</description>
</submit_code_changes>`
}
