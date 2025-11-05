# 루웨인 코어 잠금 프로토콜
core.lockdown.start
backup.create -scope core,db,persona
lock.set -target /core, /db, /personas -mode strict
branch.create -name dev_resonance
branch.redirect -from main -to dev_resonance
verify.integrity -scope core
report.generate -type lockdown_status
