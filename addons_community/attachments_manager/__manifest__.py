# -*- coding: utf-8 -*-
# Copyright (C) 2020-2021 Artem Shurshilov <shurshilov.a@yandex.ru>
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
{
    'name': "Attachments manager",

    'summary': " \
Top 30+ best feauters to manage your attachments \
attachments tags attachment tag \
Drag and Drop multiple attachments webcam attachments \
Download all files by one click \
Quick mass delete/rename/editing files in editable tree \
Click button url open popup wizard to easy adds URL \
It is possible to store only links to files, and not the files themselves \
saving disk space on the server and compatible with any storage of Google, OneDrive, DropBox, S3 Amazon \
Preview ods,odt,odp..etc in browse \
Edit on fly \
Additional and useful information about files camera snapshot \
camera rear camera front webcam rear webcam front webvam flip \
restrict user attachments restrics group \
Image files (.JPEG, .PNG, .GIF, .TIFF, .BMP) \
Video files (WebM, .MPEG4, .3GPP, .MOV, .AVI, .MPEGPS, .WMV, .FLV) \
Text files (.TXT) \
Markup/Code (.CSS, .HTML, .PHP, .C, .CPP, .H, .HPP, .JS) \
Microsoft Word (.DOC and .DOCX) \
Microsoft Excel (.XLS and .XLSX) \
Microsoft PowerPoint (.PPT and .PPTX) \
Adobe Portable Document Format (.PDF) \
Apple Pages (.PAGES) \
Adobe Illustrator (.AI) \
Adobe Photoshop (.PSD) \
Tagged Image File Format (.TIFF) \
Autodesk AutoCad (.DXF) \
Scalable Vector Graphics (.SVG) \
PostScript (.EPS, .PS) \
TrueType (.TTF) \
XML Paper Specification (.XPS) \
Archive file types (.ZIP and .RAR) \
Instagram Facebook OneDrive Google Drive Dropbox Amazon S3 \
Screencast video audio microphone import \
OFFLAIN VIDEO (WebM, .MPEG4, MKV, H264 .3GPP, .MOV, .MPEGPS) \
OFFLAIN AUDIO \
favorites attachment, like, unlike attachment \
website attachments website attachment site attachments site attachments \
website files website file website download website easy \
contextmenu attachments tag attachment tags attachment \
",

    'author': "EURO ODOO, Shurshilov Artem",
    'website': "https://eurodoo.com",
    "live_test_url": "https://eurodoo.com/login_employee?login=demo1&password=demo1",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/13.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Knowledge Management',
    'version': '15.19.4.30',
    "license": "OPL-1",
    'price': 30,
    'currency': 'EUR',
    'images': [
        'static/description/am2.png',
        'static/description/am.png',
    ],

    # any module necessary for this one to work correctly
    'depends': ['base', 'web', 'mail', 'attachments_center'],
    'installable': True,

    # always loaded
    'data': [
        # 'views/assets.xml',
        'views/document_url_view.xml',
        'security/restrict_manage_attachments_security.xml',
        'security/ir.model.access.csv',
        #'views/template.xml',
        'views/res_config_settings_views.xml',
        'views/ir_attachment_tag.xml',
        'data/email_attachment_template.xml',
    ],

    # 'qweb': [
    #     'static/src/components/attachment_slider/attachment_slider.xml',
    #     'static/src/components/attachment_custom/attachment_custom.xml',
    #     'static/src/components/attachment_list_custom/attachment_list_custom.xml',
    #     'static/src/components/message_custom/message_custom.xml',
    #     'static/src/components/attachment_box_custom/attachment_box_custom.xml',
    #     'static/src/components/attachment_box_favorites/attachment_box_favorites.xml',
    #     'static/src/components/attachment_qrcode/attachment_qrcode.xml',
    #     'static/src/components/attachment_webcam/attachment_webcam.xml',
    # ],

    "cloc_exclude": [
        "static/src/libs/**/*",  # exclude a single folder
    ],

    'assets': {
        'web.assets_backend': [
            'attachments_manager/static/src/components/**/*.js',
            # CONTEXT MENU
            'attachments_manager/static/src/libs/jQuery-contextMenu/**/*.js',
            # DOCX READER offline
            'attachments_manager/static/src/libs/mammoth/**/*.js',
            # XLSX REDER offline
            'attachments_manager/static/src/libs/sheetjs/**/*.js',
            'attachments_manager/static/src/libs/canvas-datagrid/**/*.js',

            # IMAGE EDITOR
            'attachments_manager/static/src/libs/tui/fabric.min.js',
            'attachments_manager/static/src/libs/tui/tui-code-snippet.min.js',
            'attachments_manager/static/src/libs/tui/tui-color-picker.js',
            'attachments_manager/static/src/libs/tui/FileSaver.min.js',
            'attachments_manager/static/src/libs/tui/tui.image-editor-3.7.2/dist/tui-image-editor.js',
            'attachments_manager/static/src/libs/tui/tui.image-editor-3.7.2/examples/js/theme/white-theme.js',
            'attachments_manager/static/src/libs/tui/tui.image-editor-3.7.2/examples/js/theme/black-theme.js',

            # 'attachments_manager/static/src/libs/listjs1.5.0/listjs.js',
            #  QRCODE
            'attachments_manager/static/src/libs/qrcode/qrcode.js',
            # WEBCAM
            'attachments_manager/static/src/libs/webcam.js',

            'attachments_manager/static/src/css/**/*.css',
            'attachments_manager/static/src/libs/**/*.css',
        ],
        'web.assets_qweb': [
            # 'attachments_manager/static/src/**/*.xml',
            'attachments_manager/static/src/components/attachment_slider/attachment_slider.xml',
            'attachments_manager/static/src/components/attachment_custom/attachment_custom.xml',
            'attachments_manager/static/src/components/attachment_list_custom/attachment_list_custom.xml',
            'attachments_manager/static/src/components/message_custom/message_custom.xml',
            'attachments_manager/static/src/components/attachment_box_custom/attachment_box_custom.xml',
            'attachments_manager/static/src/components/attachment_box_favorites/attachment_box_favorites.xml',
            'attachments_manager/static/src/components/attachment_qrcode/attachment_qrcode.xml',
            'attachments_manager/static/src/components/attachment_webcam/attachment_webcam.xml',
        ],
    },
}
