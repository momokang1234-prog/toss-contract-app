#!/bin/bash
cd /root/toss-contract-app

echo "1. Installing rembg..."
pip install "rembg[cli]"

echo "2. Processing each of the 4 images..."
rembg i public/assets/marquee/contract_doc_1781603373026.jpg public/assets/marquee/contract_doc_transparent.png
rembg i public/assets/marquee/digital_sign_1781603405614.jpg public/assets/marquee/digital_sign_transparent.png
rembg i public/assets/marquee/handshake_deal_1781603394558.jpg public/assets/marquee/handshake_deal_transparent.png
rembg i public/assets/marquee/salary_coins_1781603382673.jpg public/assets/marquee/salary_coins_transparent.png

echo "3. Deleting the original .jpg images..."
rm public/assets/marquee/contract_doc_1781603373026.jpg
rm public/assets/marquee/digital_sign_1781603405614.jpg
rm public/assets/marquee/handshake_deal_1781603394558.jpg
rm public/assets/marquee/salary_coins_1781603382673.jpg

echo "Processing complete."
