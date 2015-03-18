#! /bin/bash

echo "var archiveList = ["
output=""
for runDir in $( /afs/cern.ch/project/eos/installation/0.3.15/bin/eos.select ls /eos/cms/store/group/dpg_csc/comm_csc/cscval/www/results/ )
do
    if [ ! ${runDir:0:3} == "run" ]
    then
        continue
    fi
    if [ -n "$output" ]
    then
        output=","
    fi
    run=${runDir:3:${#runDir}}
    output="$output\n  \"$run\""
    printf "$output"
done
printf "\n"
echo "]"
