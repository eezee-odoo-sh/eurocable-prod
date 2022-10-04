# -*- coding: utf-8 -*-
# Copyright (C) 2020 Artem Shurshilov <shurshilov.a@yandex.ru>
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
from odoo import models


class Http(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        """ Params for dynamic interface
        """
        result = super(Http, self).session_info()
        env = self.env['ir.config_parameter'].sudo()

        result['am_menu_type'] = env.get_param('am_menu_type')
        result['am_uppy'] = env.get_param('am_uppy')
        result['am_favorite'] = env.get_param('am_favorite')
        result['am_download_all'] = env.get_param('am_download_all')
        result['am_download_filter'] = env.get_param('am_download_filter')
        result['am_webcam'] = env.get_param('am_webcam')
        result['am_default_upload'] = env.get_param('am_default_upload')

        result['am_kanban_info'] = env.get_param('am_kanban_info')
        result['am_webcam_width'] = env.get_param('am_webcam_width')
        result['am_webcam_height'] = env.get_param('am_webcam_height')
        result['am_compress_jpeg'] = env.get_param('am_compress_jpeg')
        result['am_compress_jpeg_quality'] = env.get_param('am_compress_jpeg_quality')

        return result
