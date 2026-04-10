import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """
        Called when browser opens a WebSocket connection.
        Adds this connection to the user's personal channel group.
        """
        self.user = self.scope['user']

        if self.user.is_anonymous:
            # Reject unauthenticated connections
            await self.close()
            return

        # Each user has their own group: notifications_<user_id>
        self.group_name = f'notifications_{self.user.id}'

        # Join the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected. Listening for notifications...',
        }))

    async def disconnect(self, close_code):
        """Called when browser closes the WebSocket."""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name,
            )

    async def receive(self, text_data):
        """Called when browser sends a message — not needed for notifications."""
        pass

    async def send_notification(self, event):
        """
        Called by Celery (via channel layer group_send).
        Forwards the notification to the browser.
        """
        await self.send(text_data=json.dumps({
            'type': 'deadline_alert',
            'message': event['message'],
            'task_id': event['task_id'],
        }))