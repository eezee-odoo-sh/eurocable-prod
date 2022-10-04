# -*- coding: utf-8 -*-
# Copyright 2020 Artem Shurshilov
# Odoo Proprietary License v1.0

# This software and associated files (the "Software") may only be used (executed,
# modified, executed after modifications) if you have purchased a valid license
# from the authors, typically via Odoo Apps, or if you have received a written
# agreement from the authors of the Software (see the COPYRIGHT file).

# You may develop Odoo modules that use the Software as a library (typically
# by depending on it, importing it and using its resources), but without copying
# any source code or material from the Software. You may distribute those
# modules under the license of your choice, provided that this license is
# compatible with the terms of the Odoo Proprietary License (For example:
# LGPL, MIT, or proprietary licenses similar to this one).

# It is forbidden to publish, distribute, sublicense, or sell copies of the Software
# or modified copies of the Software.

# The above copyright notice and this permission notice must be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
# DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
# ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE.

from odoo import fields, models, api
from odoo.http import request
from collections import defaultdict


# class MailMessage(models.Model):
#     _inherit = 'mail.message'

#     def _message_format(self, fnames):
#         """Reads values from messages and formats them for the web client."""
#         self.check_access_rule('read')
#         vals_list = self._read_format(fnames)
#         safari = request and request.httprequest.user_agent.browser == 'safari'

#         thread_ids_by_model_name = defaultdict(set)
#         for message in self:
#             if message.model and message.res_id:
#                 thread_ids_by_model_name[message.model].add(message.res_id)

#         for vals in vals_list:
#             message_sudo = self.browse(vals['id']).sudo().with_prefetch(self.ids)

#             # Author
#             if message_sudo.author_id:
#                 author = (message_sudo.author_id.id, message_sudo.author_id.display_name)
#             else:
#                 author = (0, message_sudo.email_from)

#             # Attachments
#             main_attachment = self.env['ir.attachment']
#             if message_sudo.attachment_ids and message_sudo.res_id and issubclass(self.pool[message_sudo.model], self.pool['mail.thread']):
#                 main_attachment = self.env[message_sudo.model].sudo().browse(message_sudo.res_id).message_main_attachment_id
#             attachment_ids = []
#             for attachment in message_sudo.attachment_ids:
#                 attachment_ids.append({
#                     'checksum': attachment.checksum,
#                     'id': attachment.id,
#                     'filename': attachment.name,
#                     'name': attachment.name,
#                     'mimetype': 'application/octet-stream' if safari and attachment.mimetype and 'video' in attachment.mimetype else attachment.mimetype,
#                     'is_main': main_attachment == attachment,
#                     'res_id': attachment.res_id,
#                     'res_model': attachment.res_model,

#                     # Attachments manager custom
#                     # Use in message, NOT chatter
#                     'create_uid': [attachment.create_uid, attachment.create_uid.name],
#                     'create_date': attachment.create_date,
#                     'file_size': attachment.file_size,
#                     'public': attachment.public,
#                     'type': attachment.type,
#                     'url': attachment.url,
#                     'is_favorite': attachment.is_favorite,
#                     'website_visible': attachment.website_visible,
#                     'tag_ids': [ (tag.id,tag.name) for tag in attachment.tag_ids] if len(attachment.tag_ids) else [],
#                 })

#             # Tracking values
#             tracking_value_ids = []
#             for tracking in message_sudo.tracking_value_ids:
#                 groups = tracking.field_groups
#                 if not groups or self.env.is_superuser() or self.user_has_groups(groups):
#                     tracking_value_ids.append({
#                         'id': tracking.id,
#                         'changed_field': tracking.field_desc,
#                         'old_value': tracking.get_old_display_value()[0],
#                         'new_value': tracking.get_new_display_value()[0],
#                         'field_type': tracking.field_type,
#                     })

#             if message_sudo.model and message_sudo.res_id:
#                 record_name = self.env[message_sudo.model] \
#                     .browse(message_sudo.res_id) \
#                     .sudo() \
#                     .with_prefetch(thread_ids_by_model_name[message_sudo.model]) \
#                     .display_name
#             else:
#                 record_name = False

#             vals.update({
#                 'author_id': author,
#                 'notifications': message_sudo.notification_ids._filtered_for_web_client()._notification_format(),
#                 'attachment_ids': attachment_ids,
#                 'tracking_value_ids': tracking_value_ids,
#                 'record_name': record_name,
#             })

#         return vals_list

