# Copyright 2022 Eezee-IT (<http://www.eezee-it.com>)
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).
from odoo import fields, models


class StockPicking(models.Model):
    _inherit = "account.move.line"

    commodity = fields.Many2one('account.intrastat.code',
                                related='product_id.intrastat_id',
                                store=True,
                                readonly=False)
