cp ./build/index.html ../be-image/server/static/map-ui/index.html
cp ./build/service-worker.js ../be-image/server/static/map-ui/service-worker.js
cp ./build/manifest.json ../be-image/server/static/map-ui/manifest.json
rm -rf ../be-image/server/static/map-ui/static
cp -R ./build/static ../be-image/server/static/map-ui/static 