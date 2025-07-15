import os
import boto3
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

def get_s3_client() -> Optional[boto3.client]:
    bucket_name = os.getenv("BUCKET_NAME")
    bucket_region = os.getenv("BUCKET_REGION")
    access_key = os.getenv("ACCESS_KEY")
    secret_access_key = os.getenv("SECRET_ACCESS_KEY")

    if not all([bucket_name, bucket_region, access_key, secret_access_key]):
        raise ValueError("One or more environment variables are missing.")

    s3_client = boto3.client(
        's3',
        region_name=bucket_region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_access_key,
    )
    return s3_client