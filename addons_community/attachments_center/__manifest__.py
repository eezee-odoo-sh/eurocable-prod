# -*- coding: utf-8 -*-
# Copyright (C) 2020-2021 Artem Shurshilov <shurshilov.a@yandex.ru>
# License OPL-1.0 or later (http://www.gnu.org/licenses/agpl).
{
    'name': "DMS attachment and document module with directory,tags,export, numbering",

    'summary':  " \
DMS \
document module document extension add directory adds directory for ir.attachment model \
export attachment export attachments exports attachments document exports document export \
document export \
attachment and document module with directory and tags document Attchment \
creation directory and folder by model record object models records objects \
security group access control \
document management system dms alfresco similar document number diretory number \
file number file sequence document search file store filestore dms document management system \
dms document document/directories document/directories/directories directory Form View document number \
document sequence document sequence document numbering document directory document folder folder \
directory attachment number attach number document attach number document numbering document number \
number attachment odoo document attachment number filestore file store file number files number \
folder document folders attachment unique number reference unique number \
",

    'author': "EURO ODOO, Shurshilov Artem",
    'website': "https://eurodoo.com",
    "live_test_url": "https://eurodoo.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/13.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Document Management',
    'version': '15.8.0.1',
    "license": "OPL-1",
    'price': 13.0,
    'currency': 'EUR',
    'images': [
        'static/description/preview.png',
    ],

    # any module necessary for this one to work correctly
    'depends': ['base', 'web'],

    # always loaded
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/ir_attachment.xml',
        'views/ir_attachment_action.xml',
        'views/menu.xml',
        # 'views/assets.xml',
        'views/ir_attachment_tag.xml',
        'views/ir_attachment_category.xml',
        'data/sequence.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'attachments_center/static/**/*',
        ],
    },
}
