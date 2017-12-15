--Creation de la clef d'encryption AES256
CREATE MASTER KEY 
ENCRYPTION BY PASSWORD = '' --supportNs

--Check si cela exist bien
SELECT name KeyName,
  symmetric_key_id KeyID,
  key_length KeyLength,
  algorithm_desc KeyAlgorithm
FROM sys.symmetric_keys;

--creation d'un certificat 'maison'
CREATE CERTIFICATE DataEncryptionNS
WITH SUBJECT = 'Facturation';

--Check si cela exist bien
SELECT name CertName,
  certificate_id CertID,
  pvt_key_encryption_type_desc EncryptType,
  issuer_name Issuer
FROM sys.certificates;

--Creation d'un clef d'encryptage a partir du certificat et de laclef
CREATE SYMMETRIC KEY SymKeyNS
WITH ALGORITHM = AES_256
ENCRYPTION BY CERTIFICATE DataEncryptionNS;

--Check si cela exist bien	
SELECT name KeyName,
  symmetric_key_id KeyID,
  key_length KeyLength,
  algorithm_desc KeyAlgorithm
FROM sys.symmetric_keys;