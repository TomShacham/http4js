#!/usr/bin/env bash

cd src/ssl

# create your own CA key
openssl genrsa \
  -out my-root-ca.key.pem \
  2048

# Create your own CA cert using CA key
# Self-sign your Root Certificate Authority
# Since this is private, the details can be as bogus as you like
openssl req \
  -x509 \
  -new \
  -nodes \
  -key my-root-ca.key.pem \
  -days 1024 \
  -out my-root-ca.cert.pem \
  -subj "/C=US/ST=Utah/L=Provo/O=ACME Signing Authority Inc/CN=example.com"

# Create a private key
# Create a Device Certificate for each domain,
# such as example.com, *.example.com, awesome.example.com
# NOTE: You MUST match CN to the domain name or ip address you want to use
openssl genrsa \
  -out key.pem \
  2048


# Make a Certificate Signing Request (csr) to then create a CA signed cert below
# Create a request from your Device, which your Root CA will sign
openssl req -new \
  -key key.pem \
  -out csr.pem \
  -subj "/C=US/ST=Utah/L=Provo/O=ACME Tech Inc/CN=localhost"

# Create CA signed cert
# Sign the request from Device with your Root CA
# -CAserial my-root-ca.srl
openssl x509 \
  -req -in csr.pem \
  -CA my-root-ca.cert.pem \
  -CAkey my-root-ca.key.pem \
  -CAcreateserial \
  -out cert.pem \
  -days 500

# Create fullchain, your new cert followed by CA cert
cat cert.pem my-root-ca.cert.pem > fullchain.pem