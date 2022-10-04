
odoo.define('attachments_center.webKanbanRecord', function(require) {
    "use strict";

    var KanbanRecord = require('web.KanbanRecord');
    var session = require('web.session');

    KanbanRecord.include({
        events: _.extend({}, KanbanRecord.prototype.events, {
            'click .on_preview_ms': '_onPreviewMSAttachment',
            'click .on_preview_google': '_onPreviewGoogleAttachment',
        }),

        attachmentUrl() {
            return session.url('/web/content', {
                id: this.recordData.id,
                download: true,
            });
        },

        async _generateAccessToken() {
            let access_token = await this._rpc({
                model: 'ir.attachment',
                method: 'generate_access_token',
                args: [
                    [this.recordData.id]
                ],
            })
            return access_token;
        },

        async _onPreviewMSAttachment(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            let odoo_url = this.attachmentUrl();
            if (this.recordData.type != 'url' && !this.recordData.public){
                let access_token = await this._generateAccessToken();
                odoo_url += '&access_token=' + access_token;
            }
    
            var url = 'https://view.officeapps.live.com/op/embed.aspx?src='+ encodeURIComponent(odoo_url);
            if (this.recordData.type === 'url')
                url = this.recordData.url;
                
            window.open(url, '_blank');
        },

        async _onPreviewGoogleAttachment(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            let odoo_url = this.attachmentUrl();
            if (this.recordData.type != 'url' && !this.recordData.public){
                let access_token = await this._generateAccessToken();
                odoo_url += '&access_token=' + access_token;
            }
    
            var url = 'https://docs.google.com/viewer?url='+ encodeURIComponent(odoo_url);
            if (this.recordData.type === 'url')
                url = this.recordData.url;
    
            window.open(url, '_blank');
        },
        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------
    
        /**
         * @override
         * @private
         */
        // _openRecord: function () {
        //     if (this.modelName === 'ir.attachment' && this.$el.parents('.o_attachments_center_attendance_kanban').length) {
        //         // needed to diffentiate : check in/out kanban view of employees <-> standard employee kanban view
        //         var action = {
        //             type: 'ir.actions.client',
        //             name: 'Confirm',
        //             tag: 'hr_attendance_kiosk_confirm',
        //             employee_id: this.record.id.raw_value,
        //             employee_name: this.record.name.raw_value,
        //             employee_state: this.record.attendance_state.raw_value,
        //             employee_hours_today: this.record.hours_today.raw_value,
        //         };
        //         this.do_action(action);
        //     } else {
        //         this._super.apply(this, arguments);
        //     }
        // }
    });
    
    });
    