# -*- coding: utf-8 -*-
######################################################################################################
#
# Copyright (C) B.H.C. sprl - All Rights Reserved, http://www.bhc.be
# Copyright (c) 2020 Shurshilov Artem (shurshilov.a@yandex.ru)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied,
# including but not limited to the implied warranties
# of merchantability and/or fitness for a particular purpose
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>
######################################################################################################
import logging
try:
    from BytesIO import BytesIO
except ImportError:
    from io import BytesIO
import zipfile
from datetime import datetime
from odoo import http
from odoo.http import request
from odoo.http import content_disposition
import ast
import json

_logger = logging.getLogger(__name__)

import base64
from werkzeug.utils import redirect
from odoo.addons.website.controllers.main import QueryURL
from odoo.addons.website_sale.controllers.main import WebsiteSale


class Binary(http.Controller):
    @http.route('/web/binary/download_document', type='http', auth="user")
    def download_document(self, res_id, res_model, **kw):
        attachment_ids = request.env['ir.attachment'].search([('res_id', '=', res_id),('res_model', '=', res_model)])
        file_dict = {}
        for attachment_id in attachment_ids:
            file_store = attachment_id.store_fname
            if file_store:
                file_name = attachment_id.name
                file_path = attachment_id._full_path(file_store)
                file_dict["%s:%s" % (file_store, file_name)] = dict(path=file_path, name=file_name)
        zip_filename = datetime.now()
        zip_filename = "%s.zip" % zip_filename
        bitIO = BytesIO()
        zip_file = zipfile.ZipFile(bitIO, "w", zipfile.ZIP_DEFLATED)
        for file_info in file_dict.values():
            zip_file.write(file_info["path"], file_info["name"])
        zip_file.close()
        return request.make_response(bitIO.getvalue(),
                                     headers=[('Content-Type', 'application/x-zip-compressed'),
                                              ('Content-Disposition', content_disposition(zip_filename))])

    @http.route('/web/binary/download_document_ids', type='http', auth="user")
    def download_document_ids(self, ids, **kw):
        attachment_ids = request.env['ir.attachment'].search([('id', 'in', list(json.loads(ids)))])
        file_dict = {}
        for attachment_id in attachment_ids:
            file_store = attachment_id.store_fname
            if file_store:
                file_name = attachment_id.name
                file_path = attachment_id._full_path(file_store)
                file_dict["%s:%s" % (file_store, file_name)] = dict(path=file_path, name=file_name)
        zip_filename = datetime.now()
        zip_filename = "%s.zip" % zip_filename
        bitIO = BytesIO()
        zip_file = zipfile.ZipFile(bitIO, "w", zipfile.ZIP_DEFLATED)
        for file_info in file_dict.values():
            zip_file.write(file_info["path"], file_info["name"])
        zip_file.close()
        return request.make_response(bitIO.getvalue(),
                                     headers=[('Content-Type', 'application/x-zip-compressed'),
                                              ('Content-Disposition', content_disposition(zip_filename))])

# class WebsiteSale(WebsiteSale):

#     @http.route(['/shop/product/<model("product.template"):product>'], type='http', auth="public", website=True)
#     def product(self, product, category='', search='', **kwargs):
#         product_context = dict(request.env.context, active_id=product.id)
#         ProductCategory = request.env['product.public.category']
#         Rating = request.env['rating.rating']
#         if category:
#             category = ProductCategory.browse(int(category)).exists()

#         attrib_list = request.httprequest.args.getlist('attrib')
#         attrib_values = [map(int, v.split("-")) for v in attrib_list if v]
#         attrib_set = set([v[1] for v in attrib_values])
#         keep = QueryURL('/shop', category=category and category.id, search=search, attrib=attrib_list)
#         categs = ProductCategory.search([('parent_id', '=', False)])
#         pricelist = request.website.get_current_pricelist()
#         from_currency = request.env.user.company_id.currency_id
#         to_currency = pricelist.currency_id
#         compute_currency = lambda price: from_currency.compute(price, to_currency)
#         # get the rating attached to a mail.message, and the rating stats of the product
#         ratings = Rating.search([('message_id', 'in', product.website_message_ids.ids)])
#         rating_message_values = dict([(record.message_id.id, record.rating) for record in ratings])
#         rating_product = product.rating_get_stats([('website_published', '=', True)])
#         if not product_context.get('pricelist'):
#             product_context['pricelist'] = pricelist.id
#             product = product.with_context(product_context)

#         attachments = request.env['ir.attachment'].sudo().search(
#             [('res_model', '=', 'product.template'),
#              ('res_id', '=', product.id),
#              ('website_visible', '=', True)], order='id')

#         values = {
#             'search': search,
#             'category': category,
#             'pricelist': pricelist,
#             'attrib_values': attrib_values,
#             'compute_currency': compute_currency,
#             'attrib_set': attrib_set,
#             'keep': keep,
#             'categories': categs,
#             'main_object': product,
#             'product': product,
#             '_get_attribute_exclusions': self._get_attribute_exclusion,
#             'rating_message_values': rating_message_values,
#             'rating_product': rating_product,
#             'attachments': attachments
#         }
#         return request.render("website_sale.product", values)

#     def _get_attribute_exclusion(self, product, reference_product=None):
#         parent_combination = request.env['product.template.attribute.value']
#         if reference_product:
#             parent_combination |= reference_product.product_template_attribute_value_ids
#             if reference_product.env.context.get('no_variant_attribute_values'):
#                 # Add "no_variant" attribute values' exclusions
#                 # They are kept in the context since they are not linked to this product variant
#                 parent_combination |= reference_product.env.context.get('no_variant_attribute_values')
#         return product._get_attribute_exclusions(parent_combination)

#     @http.route(['/attachment/download',], type='http', auth='public')
#     def download_attachment(self, attachment_id):
#         # Check if this is a valid attachment id
#         attachment = request.env['ir.attachment'].sudo().search([('id', '=', int(attachment_id))])

#         if attachment:
#             attachment = attachment[0]
#         else:
#             return redirect('/shop')

#         if attachment["type"] == "url":
#             if attachment["url"]:
#                 return redirect(attachment["url"])
#             else:
#                 return request.not_found()
#         elif attachment["datas"]:
#             data = BytesIO(base64.standard_b64decode(attachment["datas"]))
#             return http.send_file(data, filename=attachment['name'], as_attachment=True)
#         else:
#             return request.not_found()
