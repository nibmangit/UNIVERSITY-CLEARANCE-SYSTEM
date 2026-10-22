"""
Django settings.

Configuration comes from environment variables. The defaults are for local development,
so `python manage.py runserver` keeps working with no setup.
"""
import os
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent


def env_list(name, default=''):
    """Reads a comma-separated environment variable as a list."""
    return [item.strip() for item in os.environ.get(name, default).split(',') if item.strip()]


# ---------- Core ----------

ON_RENDER = bool(os.environ.get('RENDER'))  # Render sets this variable automatically

# Debug is on locally and off on Render unless you say otherwise.
DEBUG = os.environ.get('DEBUG', 'False' if ON_RENDER else 'True').lower() == 'true'

SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'django-insecure-development-only-key'
    else:
        raise ImproperlyConfigured('Set the SECRET_KEY environment variable.')

ALLOWED_HOSTS = env_list('ALLOWED_HOSTS', 'localhost,127.0.0.1')
if os.environ.get('RENDER_EXTERNAL_HOSTNAME'):  # also set by Render
    ALLOWED_HOSTS.append(os.environ['RENDER_EXTERNAL_HOSTNAME'])


# ---------- Applications ----------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',

    'tenants',
    'accounts',
    'clearance',
    'notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# ---------- Database ----------
# Render provides DATABASE_URL. Without it (your computer) the project keeps using SQLite.

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    DATABASES = {'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# ---------- Passwords and language ----------

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ---------- Static files (the Django admin's CSS and JavaScript) ----------

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
}
if not DEBUG:
    STORAGES['staticfiles'] = {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'}


# ---------- Email (unchanged from before) ----------

MAILERS = {
    'default': {
        'BACKEND': 'django.core.mail.backends.console.EmailBackend',
    },
}


# ---------- Custom configuration ----------

AUTH_USER_MODEL = 'accounts.User'

AUTHENTICATION_BACKENDS = [
    'accounts.backends.UniversityIDBackend',
    'django.contrib.auth.backends.ModelBackend',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'verify': '30/minute',
    },
}


# ---------- Which websites may call the API, and production security ----------

# The addresses of the frontend, with no trailing slash. Set CORS_ALLOWED_ORIGINS on Render
# to your Vercel address (several are allowed, separated by commas).
CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')

# Needed for logging in to the Django admin on the Render address.
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS')

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    
    
# ---------- Clearance certificate (PDF) ----------

UNIVERSITY_NAME = os.environ.get('UNIVERSITY_NAME', 'Bahir Dar University Poly Campus')

# The address of the frontend. The QR code on the certificate points to FRONTEND_URL/verify/<code>.
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173').rstrip('/')

# The time zone that dates on the certificate are shown in.
CERTIFICATE_TIME_ZONE = os.environ.get('CERTIFICATE_TIME_ZONE', 'Africa/Addis_Ababa')