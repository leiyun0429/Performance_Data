"""
WSGI config for Performance project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from libary import configuration

configuration.filter_condition_key = configuration.get_wsgi_envir()

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Performance.settings")

application = get_wsgi_application()
