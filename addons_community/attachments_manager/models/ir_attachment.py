# -*- coding: utf-8 -*-
# Copyright 2020-2021 Artem Shurshilov
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
from odoo.exceptions import UserError, ValidationError
from odoo.http import request


# class ir_attachment_tag(models.Model):
#     _name = 'ir.attachment.tag'
#     _parent_store = True

#     name = fields.Char('Tag Name', required=True, translate=True)
#     active = fields.Boolean(
#         help='The active field allows you to hide the tag without removing it.', default=True)
#     parent_id = fields.Many2one(
#         string='Parent Tag', comodel_name='ir.attachment.tag', index=True, ondelete='cascade')
#     child_id = fields.One2many(
#         string='Child Tags', comodel_name='ir.attachment.tag', inverse_name='parent_id')
#     parent_path = fields.Char(index=True)
#     image = fields.Binary('Image')

#     #@api.multi
#     def name_get(self):
#         """ Return the tags' display name, including their direct parent. """
#         res = {}
#         for record in self:
#             current = record
#             name = current.name
#             while current.parent_id:
#                 name = '%s / %s' % (current.parent_id.name, name)
#                 current = current.parent_id
#             res[record.id] = name

#         return [(record.id,  record.name) for record in self]

#     @api.model
#     def name_search(self, name, args=None, operator='ilike', limit=100):
#         args = args or []
#         if name:
#             # Be sure name_search is symetric to name_get
#             name = name.split(' / ')[-1]
#             args = [('name', operator, name)] + args
#         tags = self.search(args, limit=limit)
#         return tags.name_get()


class IrAttachment(models.Model):
    _inherit = 'ir.attachment'

    @api.depends('favorite_users_ids')
    def _compute_is_favorite(self):
        for project in self:
            project.is_favorite = self.env.user in project.favorite_users_ids

    def _inverse_is_favorite(self):
        return

    # tag_ids = fields.Many2many(string='Tags',
    #                            comodel_name='ir.attachment.tag',
    #                            relation='ir_attachment_tag_rel',
    #                            column1='tag_id',
    #                            column2='attachment_id')
    favorite_users_ids = fields.Many2many(
        'res.users', 'attachment_favorite_users_rel', 'attachment_id', 'user_id',
        string='Members')
    is_favorite = fields.Boolean(compute='_compute_is_favorite', inverse='_inverse_is_favorite', string='Show Attachment on dashboard',
                                 help="Whether this attachment should be displayed on your dashboard.", store=True)
    website_visible = fields.Boolean(string='Show attachment on website',
                                     help="Show attachment on website", default=False)

    def delete_favorites(self):
        for attachment in self:
            attachment.write({'favorite_users_ids': [[3, self.env.uid]]})
        return {'type': 'ir.actions.act_close_wizard_and_reload_attachments'}

    def add_current(self, res_model, res_id):
        if not res_id or not res_model:
            raise UserError('Dont find res_id or res_model, please do this action from chatter')
        for attachment in self:
            attachment.copy(
                {'res_id': res_id, 'res_model': res_model, 'favorite_users_ids': []})

    def download_filter(self):
        return {
            'type': 'ir.actions.act_url',
            'url': '/web/binary/download_document_ids?ids='+str(self.ids).replace(' ', ''),
        }

    @api.model
    def search_read(self, domain=None, fields=None, offset=0, limit=None, order=None):
        res = super(IrAttachment, self).search_read(domain, fields, offset, limit, order)
        # TODO: send flag as context
        # add is_favorite for change only search_read in chatter
        if 'tag_ids' in fields and 'is_favorite' in fields:
            for rec in res:
                tag_ids = []
                for tag_id in rec['tag_ids']:
                    tag = self.env['ir.attachment.tag'].browse(tag_id)
                    tag_ids.append((tag.id, tag.name))
                rec['tag_ids'] = tag_ids
        return res

    def action_attachment_send(self):
        """
        This function opens a window to compose an email,
        with the attachment center template message loaded by default
        """
        self.ensure_one()
        template_id = self.env.ref('attachments_manager.email_attachment_template')
        compose_form_id = self.env.ref('mail.email_compose_message_wizard_form')
        ctx = dict(
            default_model='ir.attachment',
            default_res_id=self.id,
            default_use_template=bool(template_id),
            default_template_id=template_id.id,
            default_composition_mode='comment',
            default_attachment_ids= [(6, 0, [self.id])],
            custom_layout='mail.mail_notification_light',
            mark_coupon_as_sent=True,
            force_email=True,
        )
        return {
            'name': 'Compose Email',
            'type': 'ir.actions.act_window',
            'view_mode': 'form',
            'res_model': 'mail.compose.message',
            'views': [(compose_form_id.id, 'form')],
            'view_id': compose_form_id.id,
            'target': 'new',
            'context': ctx,
        }
    def _attachment_format(self, commands=False):
        safari = request and request.httprequest.user_agent and request.httprequest.user_agent.browser == 'safari'
        res_list = []
        for attachment in self:
            res = {
                'checksum': attachment.checksum,
                'id': attachment.id,
                'filename': attachment.name,
                'name': attachment.name,
                'mimetype': 'application/octet-stream' if safari and attachment.mimetype and 'video' in attachment.mimetype else attachment.mimetype,

                # Attachments manager custom
                # Use in message, NOT chatter
                'create_uid': [attachment.create_uid, attachment.create_uid.name],
                'create_date': attachment.create_date,
                'file_size': attachment.file_size,
                'public': attachment.public,
                'type': attachment.type,
                'url': attachment.url,
                'is_favorite': attachment.is_favorite,
                'website_visible': attachment.website_visible,
                'tag_ids': [ (tag.id,tag.name) for tag in attachment.tag_ids] if len(attachment.tag_ids) else [],
            }
            if commands:
                res['originThread'] = [('insert', {
                    'id': attachment.res_id,
                    'model': attachment.res_model,
                })]
            else:
                res.update({
                    'res_id': attachment.res_id,
                    'res_model': attachment.res_model,
                })
            res_list.append(res)
        return res_list
