openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl_volume/domain.key \
        -out /etc/ssl_volume/domain.crt \
        -subj "/C=TR/ST=Istanbul/L=Istanbul/O=42_Kocaeli/OU=mkardes/CN=42kocaeli.com.tr/"
cp /etc/ssl_volume/domain.key /etc/ssl_volume/domain_key.pem
cp /etc/ssl_volume/domain.crt /etc/ssl_volume/domain_crt.pem

npm install react-scripts
npm start
