$cid = docker create --entrypoint bash gvenzl/oracle-free:23-slim -c "true"
Write-Host "Contenedor temporal creado: $cid"
docker cp "${cid}:/opt/oracle/product/26ai/dbhomeFree/oracore/zoneinfo/timezlrg_45.dat" .\timezlrg_45.dat
docker rm $cid

docker cp .\timezlrg_45.dat sitra-oro-oracle:/opt/oracle/product/26ai/dbhomeFree/oracore/zoneinfo/timezlrg_45.dat
docker exec -u root sitra-oro-oracle chown oracle:oinstall /opt/oracle/product/26ai/dbhomeFree/oracore/zoneinfo/timezlrg_45.dat
docker exec -u root sitra-oro-oracle chmod 644 /opt/oracle/product/26ai/dbhomeFree/oracore/zoneinfo/timezlrg_45.dat
docker exec sitra-oro-oracle ls -lh /opt/oracle/product/26ai/dbhomeFree/oracore/zoneinfo/timezlrg_45.dat
docker restart sitra-oro-oracle
Write-Host "Parche de zona horaria aplicado exitosamente a sitra-oro-oracle."
