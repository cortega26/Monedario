import os
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCRIPT_DIR = Path(__file__).resolve().parent
SERVICE_ACCOUNT_FILE = Path(
    os.environ.get(
        "GSC_SERVICE_ACCOUNT_FILE",
        SCRIPT_DIR / "credentials" / "gsc-service-account.json",
    )
)
DOMAIN = "monedario.cl"

SCOPES = [
    "https://www.googleapis.com/auth/siteverification",
]


def main():
    if not SERVICE_ACCOUNT_FILE.exists():
        raise FileNotFoundError(
            "No se encontro el archivo de credenciales de Google Search Console: "
            f"{SERVICE_ACCOUNT_FILE}\n"
            "Deja el JSON en scripts/credentials/gsc-service-account.json o define "
            "GSC_SERVICE_ACCOUNT_FILE=/ruta/al/service-account.json."
        )

    credentials = service_account.Credentials.from_service_account_file(
        str(SERVICE_ACCOUNT_FILE),
        scopes=SCOPES,
    )

    service = build("siteVerification", "v1", credentials=credentials)

    response = service.webResource().getToken(
        body={
            "site": {
                "type": "INET_DOMAIN",
                "identifier": DOMAIN,
            },
            "verificationMethod": "DNS_TXT",
        }
    ).execute()

    print("Agrega este TXT record en el DNS del dominio:")
    print()
    print(response["token"])


if __name__ == "__main__":
    main()
