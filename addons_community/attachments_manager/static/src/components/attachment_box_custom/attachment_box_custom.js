/** @odoo-module */

import { AttachmentBox } from '@mail/components/attachment_box/attachment_box';
import AttachmentWebcamDialog from '@attachments_manager/components/attachment_webcam/attachment_webcam';
import { patch } from 'web.utils';
import Dialog from 'web.Dialog';
const { useState, useRef } = owl.hooks;

Object.assign(AttachmentBox, {
    components:{
        Dialog:Dialog,
        AttachmentWebcamDialog: AttachmentWebcamDialog
    }
});
patch(AttachmentBox.prototype, 'attachments_manager/static/src/components/attachment_box_custom/attachment_box_custom.js', {
    async willStart(...args) {
        this._super(...args);
        this.state = useState({
            hasFavoritesDialog: false,
            hasWebcamDialog: false,
            snapshot: '',
            attachments_favorite: [],
            inputHidden: (window.innerWidth <= 768)
        });
        this.amThread = this.chatter.thread;
        this._amNewRef = useRef('am-new');
    },

    toggleInput() {
        this.state.inputHidden = !this.state.inputHidden;
    },

    willUnmount(){
        $(this.el).contextMenu( 'destroy' );
    },

    mounted(){
        var self = this;
        // make button open the menu
        this._amNewRef.el.addEventListener('click', (e) => {
            e.preventDefault();
            $(this._amNewRef.el).contextMenu();
        });

        $(this.el).contextMenu({
            selector: '.oe_button_control_new',
            build: function($trigger, e) {
                // this callback is executed every time the menu is to be shown
                // its results are destroyed every time the menu is hidden
                // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                return {
                    callback: function(key, options) {
                        e.target = e.currentTarget;
                        var odoo_callback = self[key].bind(self);
                        odoo_callback(e);
                    },
                    items: {
                        "_onClickAdd": {name: "My device", icon: "fa-folder-open-o", disabled: function(){ return false; }},
                        "_onAddURL": {name: "Add URL", icon: "fa-link", disabled: function(){
                            return false;
                        }},
                        "_openFrontCamera": {name: "Camera front", icon: "fa-mobile-phone", disabled: function(){ return false; }},
                        "_openRearCamera": {name: "Camera rear", icon: "fa-camera", disabled: function(){ return false; }},
                        "_onScreenCast": {name: "From Screen Record", icon: "fa-desktop", disabled: function(){
                            return false;
                        }},
                        "sep4": "---------",
                        "_onGoogleDrivePicker": {name: "From Google Drive", icon: "fa-google-plus", disabled: function(){
                            console.log(self,'self')
                            if ('_onGoogleDrivePicker' in self)
                                return false;
                            return true;
                        }},
                        "_onMicrosoftOnedrivePicker": {name: "From Microsoft Onedrive", icon: "fa-cloud", disabled: function(){
                            if ('_onMicrosoftOnedrivePicker' in self)
                                return false;
                            return true;
                        }},
                        "_onDropboxPicker": {name: "From Dropbox", icon: "fa-dropbox", disabled: function(){
                            if ('_onDropboxPicker' in self)
                                return false;
                            return true;
                        }},
                        // "_onOwnCloudPicker": {name: "From Own Cloud", icon: "fa-soundcloud", disabled: function(){
                        //     if ('_onOwnCloudPicker' in self)
                        //         return false;
                        //     return true;
                        // }},
                        "_onAmazonPicker": {name: "From Amazon", icon: "fa-amazon", disabled: function(){
                            if ('_onAmazonPicker' in self)
                                return false;
                            return true;
                        }},
                        "_onFacebookPicker": {name: "From Facebook", icon: "fa-facebook", disabled: function(){
                            if ('_onFacebookPicker' in self)
                                return false;
                            return true;
                        }},
                        "_onInstagramPicker": {name: "From Instagram", icon: "fa-instagram", disabled: function(){
                            if ('_onInstagramPicker' in self)
                                return false;
                            return true;
                        }},
                        "sep5": "---------",
                        "hide_context": {name: "Close", icon: "fa-remove"}
                    },
                };
            }
        });
    },

    hide_context (ev) {
        ev.stopPropagation();
        ev.preventDefault();
    },

    _hasNoTag(attachment, tag_name){
        for (let i=0; i<attachment.tag_ids.length; i++)
            if (attachment.tag_ids[i][1].indexOf(tag_name)+1)
                return false
        return true
    },

    _onFilterTagThread(ev){
        if (!ev.target.value){
            this.amThread.refresh()
            return true
        }

        this.amThread.update({
            originThreadAttachments: [['unlink',
            this.amThread.allAttachments.filter(attachment => this._hasNoTag(attachment, ev.target.value))
            ]],
        });
    },

    _onRefreshThread(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.amThread.refresh();
    },

    _onDownloadAll(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        window.location.href = '/web/binary/download_document?res_id=' + this.amThread.id + '&res_model=' + this.amThread.model;
    },

    _openAttachmentManagerPublic(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        const action = {
            type: 'ir.actions.act_window',
            name: this.env._t("Attachment Management public"),
            res_model: 'ir.attachment',
            domain: [['public','=',true]],
            view_mode: 'tree,form',
            views: [
                [false, 'list'],
                [false, 'form']
            ],
        };
        return this.env.bus.trigger('do-action', {
            action,
            options: {
                on_close: () => {
                    this.amThread.fetchAttachments.bind(this.amThread)();
                },
            },
        });
    },

    _openAttachmentManager(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        console.log(this)
        const action = {
            type: 'ir.actions.act_window',
            name: this.env._t("Attachment Management current"),
            res_model: 'ir.attachment',
            domain: [
                '&',
                ['res_model', '=', this.amThread.model],
                ['res_id', '=', this.amThread.id]
            ],
            view_mode: 'tree,form',
            views: [
                [false, 'list'],
                [false, 'form']
            ],
        };
        return this.env.bus.trigger('do-action', {
            action,
            options: {
                on_close: () => {
                    this.amThread.fetchAttachments.bind(this.amThread)();
                },
            },
        });
    },

    _openFavoritesManager(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        const action = {
            type: 'ir.actions.act_window',
            name: this.env._t("Attachment Management"),
            res_model: 'ir.attachment',
            domain: [['favorite_users_ids','in',this.env.session.uid],['is_favorite','=',true]],
            view_mode: 'tree,form',
            views: [
                [false, 'list'],
                [false, 'form']
            ],
            params: {
                context: {
                'default_model_id': this.amThread.model,
                'default_res_id': this.amThread.id
                }
            }
        };
        return this.env.bus.trigger('do-action', {
            action,
            options: {
                on_close: () => {
                    this.amThread.fetchAttachments.bind(this.amThread)();
                },
            },
        });
    },

    _onAddURL(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        const action = {
            type: 'ir.actions.act_window',
            name: this.env._t("Attachment Management Add URL"),
            res_model: 'ir.attachment.add_url',
            domain: [['favorite_users_ids','in',this.env.session.uid],['is_favorite','=',true]],
            view_mode: 'form,tree',
            target: 'new',
            views: [[false, 'form']],
            context: {
                'default_res_model': this.amThread.model,
                'default_res_id': this.amThread.id
            }
        };
        return this.env.bus.trigger('do-action', {
            action,
            options: {
                on_close: () => {
                    this.amThread.fetchAttachments.bind(this.amThread)();
                },
            },
        });
    },

    _onFavoritesClosed(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.state.hasFavoritesDialog = false;
        this.amThread.fetchAttachments.bind(this.amThread)();
    },

    async _openFavorites(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        const attachmentsFavoritesData = await this.amThread.async(() => this.env.services.rpc({
            model: 'ir.attachment',
            method: 'search_read',
            domain: [['favorite_users_ids','in',this.env.session.uid],['is_favorite','=',true]],
            fields: ['id', 'name', 'mimetype', 'create_uid', 'create_date', 'file_size', 'public', 'type', 'url', 'is_favorite'],
            orderBy: [{ name: 'id', asc: false }],
        }, { shadow: true }));

        this.state.attachments_favorite = await attachmentsFavoritesData.map(data =>
                    this.env.models['mail.attachment'].convertData(data)
                ).map(attachment => `mail.attachment_${attachment.id}`);

        
        this.state.hasFavoritesDialog = true;
    },

    _openRearCamera(ev){
        this.webcamRear = true;
        this.state.hasWebcamDialog = true;
    },

    _openFrontCamera(ev){
        this.state.hasWebcamDialog = true;
    },

    _onWebcamClosed(){
        this.state.hasWebcamDialog = false;
        this.webcamRear = false;
    },

    _onWebcamCallback(ev){
        // TO DO refresh
        // updating temp attachment or iverride fileuploader _createTemporaryAttachments func
        this._fileUploaderRef.comp.uploadFiles([ev.detail]);
    }
});

export default AttachmentBox;
