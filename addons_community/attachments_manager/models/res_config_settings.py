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


class ResConfigSettingsAM(models.TransientModel):
    _inherit = 'res.config.settings'

    am_menu_type = fields.Selection(string="Type of menu adds files attachments",
                                 selection=[('list', "List (plus button)"), ('icons', "Icons (Icons below)"), ('both', "Both (show icons and list)")],
                                 default='list')
    am_uppy = fields.Selection(string="Uppy block show/hide",
                                 selection=[('hide', "Hide"), ('show', "Show")],
                                 default='show')
    am_favorite = fields.Selection(string="Favorite button show/hide",
                                 selection=[('hide', "Hide"), ('show', "Show")],
                                 default='show')
    am_download_all = fields.Selection(string="Download all button show/hide",
                                 selection=[('hide', "Hide"), ('show', "Show")],
                                 default='show')
    am_download_filter = fields.Selection(string="Download by filter button show/hide",
                             selection=[('hide', "Hide"), ('show', "Show")],
                             default='show')
    am_webcam = fields.Selection(string="Webcam button show/hide",
                         selection=[('hide', "Hide"), ('show', "Show")],
                         default='show')
    am_default_upload = fields.Selection(string="Default odoo upload button show/hide",
                         selection=[('hide', "Hide"), ('show', "Show")],
                         default='hide')
    am_kanban_info = fields.Boolean(string="Chatter kanban with extra info", default=True)
    am_webcam_width = fields.Char(string="Default webcam width", default='320')
    am_webcam_height = fields.Char(string="Default webcam height", default='240')
    am_compress_jpeg = fields.Boolean(string="Compress jpeg/png/webp attachments?", default=False)
    am_compress_jpeg_quality = fields.Float(string="Quality compress", default=0.9, help ="(value 0-1, where 1 = not compress(original), 0.7 = 70% quality)")

    def set_values(self):
        res = super(ResConfigSettingsAM, self).set_values()
        config_parameters = self.env['ir.config_parameter']
        config_parameters.set_param("am_menu_type", self.am_menu_type)
        config_parameters.set_param("am_uppy", self.am_uppy)
        config_parameters.set_param("am_favorite", self.am_favorite)
        config_parameters.set_param("am_download_all", self.am_download_all)
        config_parameters.set_param("am_download_filter", self.am_download_filter)
        config_parameters.set_param("am_webcam", self.am_webcam)
        config_parameters.set_param("am_default_upload", self.am_default_upload)

        config_parameters.set_param("am_kanban_info", self.am_kanban_info)
        config_parameters.set_param("am_webcam_width", self.am_webcam_width)
        config_parameters.set_param("am_webcam_height", self.am_webcam_height)
        config_parameters.set_param("am_compress_jpeg", self.am_compress_jpeg)
        config_parameters.set_param("am_compress_jpeg_quality", self.am_compress_jpeg_quality)
        return res

    @api.model
    def get_values(self):
        res = super(ResConfigSettingsAM, self).get_values()
        res.update(am_menu_type=self.env['ir.config_parameter'].get_param('am_menu_type'))
        res.update(am_uppy=self.env['ir.config_parameter'].get_param('am_uppy'))
        res.update(am_favorite=self.env['ir.config_parameter'].get_param('am_favorite'))
        res.update(am_download_all=self.env['ir.config_parameter'].get_param('am_download_all'))
        res.update(am_download_filter=self.env['ir.config_parameter'].get_param('am_download_filter'))
        res.update(am_webcam=self.env['ir.config_parameter'].get_param('am_webcam'))
        res.update(am_default_upload=self.env['ir.config_parameter'].get_param('am_default_upload'))

        res.update(am_kanban_info=self.env['ir.config_parameter'].get_param('am_kanban_info'))
        res.update(am_webcam_width=self.env['ir.config_parameter'].get_param('am_webcam_width'))
        res.update(am_webcam_height=self.env['ir.config_parameter'].get_param('am_webcam_height'))
        res.update(am_compress_jpeg=self.env['ir.config_parameter'].get_param('am_compress_jpeg'))
        res.update(am_compress_jpeg_quality=self.env['ir.config_parameter'].get_param('am_compress_jpeg_quality'))
        return res
