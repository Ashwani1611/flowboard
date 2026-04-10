"""
ASGI config for flowboard project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'flowboard.settings')

# This line must run before any imports that touch Django models
django_asgi_app = get_asgi_application()

# Now safe to import anything that uses models

from channels.routing import ProtocolTypeRouter, URLRouter
from flowboard.middleware import JWTAuthMiddleware
import tasks.routing

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddleware(
        URLRouter(
            tasks.routing.websocket_urlpatterns
        )
    ),
})