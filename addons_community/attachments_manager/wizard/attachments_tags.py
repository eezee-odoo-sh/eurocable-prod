# -*- coding: utf-8 -*-
#    Copyright (c) 2018-2021 Shurshilov Artem (shurshilov.a@yandex.ru)


from odoo import fields, models, api
try:
    # Python 3
    from urllib.parse import urlparse
except:
    from urlparse import urlparse
import requests
import base64


class AddTagWizard(models.TransientModel):
    _name = 'ir.attachment.add_tag'

    name = fields.Char('Name', required=True)
    url = fields.Char('URL', required=True)
    copy = fields.Boolean('Download and copy in Odoo?', required=False)

    def action_add_url(self):
        """Adds the URL with the given name as an ir.attachment record."""

        if not self._context.get('default_res_model'):
            return
        attachment_obj = self.env['ir.attachment']
        for form in self:
            url = urlparse(form.url)
            if not url.scheme:
                url = urlparse('%s%s' % ('http://', form.url))
            if not form.copy:
                attachment = {
                    'name': form.name,
                    'type': 'url',
                    # 'url': form.url,
                    'url': url.geturl(),
                    'res_id': self._context.get('default_res_id', False),
                    'res_model': self._context.get('default_res_model', False),
                }
            else:
                file = requests.get(url.geturl())
                attachment = {
                    'name': form.name,
                    'type': 'binary',
                    'datas': base64.b64encode(file.content),
                    'res_id': self._context.get('default_res_id', False),
                    'res_model': self._context.get('default_res_model', False),
                }
            attachment_obj.create(attachment)
        #return {'type': 'ir.actions.act_close_wizard_and_reload_attachments'}
