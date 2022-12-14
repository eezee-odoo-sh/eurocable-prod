# Copyright 2022 Eezee-IT (<http://www.eezee-it.com>)
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).
from odoo import api, fields, models

class SalesWizard(models.TransientModel):
    _name = 'sales.wizard'
    _description = 'sales wizard'

    message = fields.Text(string="The VAT field of partner is empty",
                          readonly=True,
                          store=True)
    sales_id = fields.Many2one('sale.order')

    @api.model
    def default_get(self, fields):
        vals = super(SalesWizard, self).default_get(fields)
        active_id = self.env.context.get("active_id")
        sale = self.env['sale.order'].browse(active_id)
        vals['sales_id'] = sale.id
        return vals

    def confirm_sale_order(self):
        return self.sales_id.action_confirm()
