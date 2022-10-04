# Copyright 2020 Creu Blanca
# Copyright 2017-2019 MuK IT GmbH
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

import logging

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class Category(models.Model):
    _name = "ir.attachment.category"
    _description = "Document Category"

    _parent_store = True
    # _parent_name = "parent_id"

    _order = "count_total_files desc,complete_name asc"
    _rec_name = "complete_name"

    # ----------------------------------------------------------
    # Database
    # ----------------------------------------------------------

    name = fields.Char(string="Name", required=True, translate=True)

    active = fields.Boolean(
        default=True,
        help="The active field allows you to hide the category without removing it.",
    )
    complete_name = fields.Char(compute="_compute_complete_name", store=True, recursive=True)
    parent_id = fields.Many2one(
        comodel_name="ir.attachment.category",
        string="Parent Category",
        ondelete="cascade",
        index=True,
    )

    child_category_ids = fields.One2many(
        comodel_name="ir.attachment.category",
        inverse_name="parent_id",
        string="Child Categories",
    )

    parent_path = fields.Char(string="Parent Path", index=True)

    file_ids = fields.One2many(
        comodel_name="ir.attachment",
        inverse_name="category_id",
        string="Files",
        readonly=True,
    )

    model_id = fields.Many2one(comodel_name="ir.model", string='Model')

    group_ids = fields.Many2many('res.groups', string='Groups')
    create_check = fields.Boolean('Check groups on create operations', default=False)
    write_check = fields.Boolean('Check groups on write operations', default=False)
    delete_check = fields.Boolean('Check groups on delete operations', default=False)

    count_categories = fields.Integer(
        compute="_compute_count_categories", string="Count Subcategories"
    )

    count_total_categories = fields.Integer(
        compute="_compute_count_total_categories", string="Count Total Subcategories"
    )

    count_files = fields.Integer(compute="_compute_count_files", string="Count Files")

    count_total_files = fields.Integer(
        compute="_compute_count_total_files", string="Total Files", store=True
    )

    # ----------------------------------------------------------
    # Constrains
    # ----------------------------------------------------------

    _sql_constraints = [
        ("name_uniq", "unique (name)", "Category name already exists!"),
        ("model_uniq", "unique (model_id)", "Category model name already exists!"),
    ]

    # ----------------------------------------------------------
    # Read
    # ----------------------------------------------------------

    @api.depends("name", "parent_id.complete_name")
    def _compute_complete_name(self):
        for category in self:
            if category.parent_id:
                category.complete_name = "{} / {}".format(
                    category.parent_id.complete_name, category.name,
                )
            else:
                category.complete_name = category.name

    @api.depends("child_category_ids")
    def _compute_count_categories(self):
        for record in self:
            record.count_categories = len(record.child_category_ids)

    def _compute_count_total_files(self):
        model = self.env["ir.attachment"]
        for record in self:
            record.count_total_files = model.search_count(
                [("category_id", "child_of", record.id)]
            )

    def _compute_count_total_categories(self):
        for record in self:
            count = self.search_count([("id", "child_of", record.id)])
            count = count - 1 if count > 0 else 0
            record.count_total_categories = count

    @api.depends("file_ids")
    def _compute_count_files(self):
        for record in self:
            record.count_files = len(record.file_ids)

    # ----------------------------------------------------------
    # Create
    # ----------------------------------------------------------

    @api.constrains("parent_id")
    def _check_category_recursion(self):
        if not self._check_recursion():
            raise ValidationError(_("Error! You cannot create recursive categories."))
        return True

    @api.model
    def create(self,vals):
        res = super(Category, self).create(vals)
        if res and vals.get('model_id'):
            model = self.env['ir.model'].sudo().browse(vals.get('model_id'))
            self.env['ir.attachment']._check_groups_access(res.group_ids)
            self.env['ir.attachment'].sudo().search([('res_model','=',model.model)]).update({'category_id': res.id})
        return res
