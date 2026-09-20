# bash/ Guide & Compliance

## Errors / Troubleshooting

If the automated check doesn't initiate upon initial clone/fork, verify your shell(bash) path.

Currently, the path is hardcoded to `/bin/bash`.

You can check your shell path with `command -v bash`

Then execute the check suite manually with these commands:
`chmod +x ./bash/run_all.sh`
`bash/run_all.sh`

If the bash checks still doesn't initiate, try running the env config check:
`chmod +x ./bash/env.sh`
`bash/env.sh`

If the local env config check returns with no error flags, but the full workflow check still doesn't initiate after running
`chmod +x ./bash/run_all.sh`
`bash/run_all.sh`
hit me up:
[Contact](mailto:otto.mularii@gmail.com)
