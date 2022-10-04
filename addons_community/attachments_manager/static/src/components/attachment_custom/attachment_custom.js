/** @odoo-module */

import { AttachmentCard } from '@mail/components/attachment_card/attachment_card';
import Dialog from 'web.Dialog';
import { AttachmentQrcodeDialog } from 'attachments_manager/static/src/components/attachment_qrcode/attachment_qrcode.js';
import { AttachmentSidebar } from 'attachments_manager/static/src/components/attachment_slider/attachment_slider.js';
import { patch } from 'web.utils';
import { attr } from '@mail/model/model_field';
import { 
    registerClassPatchModel,
    registerInstancePatchModel,
    registerFieldPatchModel } from '@mail/model/model_core';
const { useState, useRef } = owl.hooks;
import { qweb as QWeb, _t } from 'web.core';

/**
 * Returns a human readable size
 *
 * @param {Number} size number of bytes
 */
function human_size(size, _t) {
    var units = "Bytes|Kb|Mb|Gb|Tb|Pb|Eb|Zb|Yb".split('|');
    var i = 0;
    while (size >= 1024) {
        size /= 1024;
        ++i;
    }
    return size.toFixed(2) + ' ' + units[i].trim();
}

patch(AttachmentCard.prototype, 'attachments_manager/static/src/components/attachment_custom/attachment_custom.js', {
    async willStart(...args) {
        this._super(...args);
        this.state = useState({
            attachment: null,
            isMobile: (window.innerWidth <= 768),
            hasQrcodeDialog: false,
            hasDcoxDialog: false,
            hasXlsxDialog: false,
            urlPreview: false,
            magicPreviewId: false
        });
        this.attachment = this.attachmentCard.attachment
        this._dialogRefDocx = useRef('docx');
        this._dialogRefXlsx = useRef('xlsx');
    },

    willUnmount(){
        $(this.el).contextMenu( 'destroy' );
        if (this.attachmentCard)
            this.el.removeEventListener('dblclick', this.attachmentCard.onClickImage, true);
    },

    mounted(){
        console.log(this)
        if (this.attachmentCard)
            this.el.addEventListener('dblclick', this.attachmentCard.onClickImage, true);
        let self = this;
        let menu = {
            selector: '.o_AttachmentCard, .AttachmentKanbanInfo',
            build: function($trigger, e) {
                console.log(e);
                // this callback is executed every time the menu is to be shown
                // its results are destroyed every time the menu is hidden
                // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                return {
                    callback: function(key, options) {
                        try {
                            e.target = e.currentTarget;
                            console.log(self,'!!!!!!!!!!!!!!!!!!')
                            var odoo_callback = self[key].bind(self);
                            odoo_callback(e);
                        }
                        catch (e) {self[key](e)}
                        //this._disableAttachment();
                    },
                    items: {
                        "onEditAttachment": {name: "Edit record", icon: "fa-edit", disabled: function(){ return false; }},
                        "onMagicEditAttachment": {name: "Image editor", icon: "fa-magic", disabled: function(){
                            return !(self.attachment.mimetype && self.attachment.mimetype.split('/')[0] === 'image');
                        }},
                        "onClickDownload": {name: "Download", icon: "fa-download", disabled: function(){ return false; }},
                        "onOpenNewTab": {name: "Open new tab", icon: "fa-external-link", disabled: function(){ return false; }},
                        "onClickUnlink": {name: "Delete", icon: "fa-times", disabled: function(){
                            return false;
                        }},
                        "sep": "---------",
                        "fold7": {
                            "name": "Copy as link", 
                            "items": {
                                "_onCopyLink": {name: "Copy as link internal", icon: "fa-link", disabled: function(){
                                    return false;
                                }},
                                "_onCopyLinkWithToken": {name: "Copy as link with access token", icon: "fa-globe", disabled: function(){
                                    return false;
                                }},
                            },
                            //"icon": "fa-navicon"
                        },
                        "fold1": {
                            "name": "More actions", 
                            "items": {
                                "onRenameAttachment": {name: "Rename", icon: "fa-i-cursor", disabled: function(){ return false; }},
                                "onSendEmail": {name: "Send email", icon: "fa-envelope-o", disabled: function(){ return false; }},
                                "onAddTag": {name: "Add tag", icon: "fa-tag", disabled: function(){ return false; }},
                                "onQRcode": {name: "QRcode", icon: "fa-qrcode", disabled: function(){
                                    return false;
                                }},
                            },
                            //"icon": "fa-navicon"
                        },
                        "fold2": {
                            "name": "Export", 
                            "items": {
                                "_onExportGdrive": {name: "to Gdrive", icon: "fa-google-plus", disabled: function(){ 
                                    if (!self._onExportGdrive)
                                        return true;
                                    if (self.attachment.type == 'url')
                                        return true;
                                    }},
                                "_onExportOnedrive": {name: "to Onedrive", icon: "fa-windows", disabled: function(){ return !self._onExportOnedrive; }},
                                "_onExportDropbox": {name: "to Dropbox", icon: "fa-dropbox", disabled: function(){ return !self._onExportDropbox; }},
                            },
                            //"icon": "fa-navicon"
                        },
                        "sep1": "---------",
                        "fold3": {
                            "name": "Preview new tab with..", 
                            "items": {
                                "onPreviewOfflain": {name: "Preview offlain", icon: "fa-eye", disabled: function(){ return false; }},
                                "onPreviewMSAttachment": {name: "Preview MS", icon: "fa-windows", disabled: function(key, options){
                                    if (self.attachment.type == 'url')
                                        return false;
                                    // if (!self.attachment.public)
                                    //     return true;
                                    return (self.attachment.mimetype && self.attachment.mimetype.split('/')[0] === 'image');
                                }},
                                "onPreviewGoogleAttachment": {name: "Preview Google", icon: "fa-google", disabled: function(){
                                    if (self.attachment.type == 'url')
                                        return false;
                                    // if (!self.attachment.public)
                                    //     return true;
                                    return (self.attachment.mimetype && self.attachment.mimetype.split('/')[0] === 'image');
                                }},
                            },
                            //"icon": "fa-eye"
                        },
                        "fold4": {
                            "name": "Edit embeded with..", 
                            "items": {
                                "onPreviewEmbededMSAttachment": {name: "Microsoft Office", icon: "fa-windows", disabled: function(key, options){
                                    if (self.attachment.type == 'url')
                                        return false;
                                    // if (!self.attachment.public)
                                    //     return true;
                                    return (self.attachment.mimetype && self.attachment.mimetype.split('/')[0] === 'image');
                                }},
                                "onPreviewEmbededGoogleAttachment": {name: "Google Docs editor", icon: "fa-google", disabled: function(){
                                    if (self.attachment.type == 'url')
                                        return false;
                                    // if (!self.attachment.public)
                                    //     return true;
                                    return (self.attachment.mimetype && self.attachment.mimetype.split('/')[0] === 'image');
                                }},
                            },
                            //"icon": "fa-eye"
                        },
                        "sep2": "---------",
                        "onUnShareAttachment": {name: "Un Share", icon: "fa-share-alt-square", disabled: function(){
                            return !self.attachment.public || self.attachment.type == 'url';
                        }},
                        "onShareAttachment": {name: "Share", icon: "fa-share-alt", disabled: function(){
                            return (self.attachment.public || self.attachment.type == 'url');
                        }},
                        "onLike": {name: "Like", icon: "fa-heart", disabled: function(){
                            return self.attachment.is_favorite;
                        }},
                        "onUnlike": {name: "Unlike", icon: "fa-heart-o", disabled: function(){
                            return !self.attachment.is_favorite;
                        }},
/*                            "sep3": "---------",
                        "_onWebsiteVisible": {name: "Website visible", icon: "fa-globe", disabled: function(){
                            if (self.currentResModel != 'product.product' && self.currentResModel != 'product.template')
                                return true;
                            return this.data('website_visible');
                        }},
                        "_onWebsiteUnVisible": {name: "Website unvisible", icon: "fa-lock", disabled: function(){
                            if (self.currentResModel != 'product.product' && self.currentResModel != 'product.template')
                                return true;
                            return !this.data('website_visible');
                        }},*/
                        "sep4": "---------",
                        "openInfo": {name: "Info", icon: "fa-info-circle", disabled: function(){ return false; }},
                        "sep5": "---------",
                        "hide_context": {name: "Close", icon: "fa-remove"}
                    },
                };
            }
        }
        $(this.el).contextMenu(menu);
    },

    _onDocxDialogClosed(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.state.hasDcoxDialog = false;
            this._dialogRefDocx.comp._close();
    },

    _onXlsxDialogClosed(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.state.hasXlsxDialog = false;
        this._dialogRefXlsx.comp._close();
    },

    onPreviewOfflain(ev) {
        let need_super = true;
        let self = this;
        // TEXT 
        // if (this.attachment.mimetype.split('/').shift() == 'text' ||
        //     ['application/javascript', 'application/json'].includes(this.attachment.mimetype)){
        //     self._openText(this.attachment);
        //     need_super = false;
        //     return;
        // }

        // OPEN DOCX
        if (this.attachment.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml' ||
            this.attachment.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            self._openDocx(this.attachment);
            need_super = false;
            return;
        }

        //OPEN XLSX
        if (this.attachment.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            this.attachment.mimetype == 'application/vnd.ms-excel') {
            self._openXlsx(this.attachment);
            need_super = false;
            return;
        }
        if (need_super)
            this.attachmentCard.onClickImage();
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    _openDocx(attachment) {
        var self = this;
        var def = this._downloadAttachmentFromOdoo(attachment);
        def.then(blob => {
            console.log("Downloaded")
            console.log(blob)
            blob.arrayBuffer().then(buffer => {
                mammoth.convertToHtml({ arrayBuffer: buffer }).then(function (resultObject) {
                    var media = {
                        'filename': attachment.name,
                        'html': resultObject.value
                };
                // TODO open as owl dialog
                // self.state.hasDcoxDialog = media;

                var AttachmentPreview = $(QWeb.render("DocxPreview", {widget:media}));
                var popup_preview = new Dialog(self, {
                    size: 'large',
                    dialogClass: 'o_act_window',
                    title: _t("Attachments manager docx preview"),
                    $content: AttachmentPreview,
                    buttons: [
                        {
                            text: _t("Close"), close: true
                        }
                    ]
                }).open();
                });

            });
        });
    },

    _openXlsx(attachment) {
        var self = this;
        var def = this._downloadAttachmentFromOdoo(attachment);
        def.then(blob => {
            blob.arrayBuffer().then(async buffer => {
                console.log("Downloaded xlsx")
                // TODO open as owl dialog
                
                // self.state.hasXlsxDialog = true;
                await this.sleep(200);
                var wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
                var htmlstr = XLSX.write(wb, { type: 'string', bookType: 'html' });

                var sheetName = wb.SheetNames[0];
                var jsondata = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { raw: true, defval: null });

                // var grid = canvasDatagrid({
                //     parentNode: $('#xlsx')[0],
                //     data: jsondata
                // });
                // $('#xlsx').append(grid);
                // $('.modal-dialog').css('max-width', '100%');


                var media = {
                    'filename': attachment.name,
                };
                var AttachmentPreview = $(QWeb.render("XlsxPreview", { widget: media }));
                var popup_preview = new Dialog(self, {
                    //size: 'large',
                    fullscreen: true,
                    dialogClass: 'o_act_window',
                    title: _t("Attachments manager xlsx preview"),
                    $content: AttachmentPreview,
                    buttons: [
                        {
                            text: _t("Close"), close: true
                        }
                    ]
                }).open();

                popup_preview.opened(res => {
                    var grid = canvasDatagrid({
                        parentNode: $('#xlsx')[0],
                        data: jsondata
                    });
                    $('#xlsx').append(grid);
                    $('.modal-dialog').css('max-width', '100%');
                });

            });

        });
    },

    async onClickUnlink(ev) {
        ev.stopPropagation();

        let restrict_delete = await this.env.session.user_has_group('attachments_manager.group_am_delete')
        if (restrict_delete){
            alert('Sorry, you dont have access to delete this attachment')
            return
        }
        // TODO SUPER
        if (!this.attachment) {
            return;
        }
        if (this.attachment.isLinkedToComposer) {
            this.attachment.remove();
            this.trigger('o-attachment-removed', { attachmentLocalId: this.props.attachmentLocalId });
        } else {
            this.state.hasDeleteConfirmDialog = true;
        }
        
    },

    attachmentUrlNoDownload() {
        if (this.attachment.isTemporary) {
            return '';
        }
        return this.env.session.url('/web/content', {
            id: this.attachment.id,
        });
    },

    hide_context (ev) {
        ev.stopPropagation();
        ev.preventDefault();
    },

    toggleSidebar(ev) {
        console.log("toggleSidebar Attachment");
        ev.stopPropagation();
        ev.preventDefault();
        this.state.attachment = this.state.attachment ? null : this.attachment;
    },

    onRenameAttachment(ev) {
        this.onEditAttachment(ev)
    },

    onAddTag(ev) {
        this.onEditAttachment(ev)
    },

    async onSendEmail (ev) {
        ev.stopPropagation();
        ev.preventDefault();
        console.log(this.env)
        let action = await this.env.services.rpc({
            model: 'ir.attachment',
            method: 'action_attachment_send',
            args: [[this.attachment.id]],
        })

        return this.env.bus.trigger('do-action', {
            action,
            options: {
                on_close: () => {
                    this.attachment.originThread.fetchAttachments.bind(this.attachment.originThread)();
                },
            },
        });
    },

    onEditAttachment(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        //am_view_attachment_form
        const action = {
            type: 'ir.actions.act_window',
            name: this.env._t("Attachment Editor"),
            res_model: 'ir.attachment',
            views: [[false, 'form']],
            target: 'new',
            //view_id: view_id,
/*            context: {
                default_res_id: this.chatter.thread.id,
                default_res_model: this.chatter.thread.model,
            },*/
            res_id: this.attachment.id,
        };
        return this.env.bus.trigger('do-action', {
            action,
            options: {
                on_close: () => {
                    this.attachment.originThread.fetchAttachments.bind(this.attachment.originThread)();
                },
            },
        });
    },

    openInfo(ev) {
        ev.stopPropagation();
        ev.preventDefault();
/*        var activeAttachmentID = $(ev.currentTarget).data('id');
        var attachment = this._getAttachmentsByID(activeAttachmentID);

        var AttachmentInfo = $(QWeb.render("AttachmentInfo", {attachment:attachment}));
        var popup_preview = new Dialog(this, {
            size: 'large',
            dialogClass: 'o_act_window',
            title: _t("Attachments manager info"),
            $content: AttachmentInfo,
            buttons: [
                {
                    text: _t("Close"), close: true
                }
            ]
        }).open();*/
    },

    onMagicEditAttachment(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.tui_image_open();
    },

    tui_image_open() {
        var self = this;
        var tui_div = jQuery('<div/>', {
            id: 'tui-image-editor-container',
        });
        tui_div.appendTo($('body'));

        // Create an instance of the tui imageEditor, loading a blank image
        var imageEditor = new tui.ImageEditor('#tui-image-editor-container', {
            includeUI: {
                loadImage: {
                    path: this.attachmentUrl + '&' + this.state.magicPreviewId,
                    name: 'Blank'
                },
                theme: blackTheme,
                initMenu: 'filter',
                menuBarPosition: 'bottom'
            },
        });
        $('#tui-image-editor-container').fadeIn('show');


        var close = $('<div class="tui-image-editor-close-btn" style="background-color: #fff;border: 1px solid #ddd;color: #222;font-family: "Noto Sans", sans-serif;font-size: 12px">Close</div>');
        var save = $('<div class="tui-image-editor-save-btn" style="background-color: #fff;border: 1px solid #ddd;color: #222;font-family: "Noto Sans", sans-serif;font-size: 12px">Save</div>');
        close.insertAfter($('.tui-image-editor-download-btn'));
        save.insertAfter($('.tui-image-editor-download-btn'));
        $('.tui-image-editor-close-btn').click(function() {
            $('#tui-image-editor-container').fadeOut();
        });

        $('.tui-image-editor-save-btn').click(()=> {
            var data = imageEditor.toDataURL();
            data = data.split(',')[1];

            self.env.services.rpc({
                model: 'ir.attachment',
                method: 'write',
                args: [[self.attachment.id], {
                    datas: data,
                }],
            }).then( () => {
                console.log('image success save');
                this.state.magicPreviewId = _.uniqueId('magic_preview');
                self.attachment.originThread.fetchAttachments.bind(self.attachment.originThread)();
                tui_div.remove();
            });
        });

        // Auto resize the editor to the window size:
        window.addEventListener("resize", function() {
            imageEditor.ui.resizeEditor();
        });
    },

    async onUnShareAttachment(ev) {
        this.onShareAttachment(ev);
    },

    async onShareAttachment(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        await this.env.services.rpc({
            model: 'ir.attachment',
            method: 'write',
            args: [[this.attachment.id], {
                public: !this.attachment.public
            }]
        });

        await this.attachment.originThread.fetchAttachments.bind(this.attachment.originThread)();
    },

    async onLike(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        await this.env.services.rpc({
            model: 'ir.attachment',
            method: 'write',
            args: [[this.attachment.id], {
                favorite_users_ids: [[4, this.env.session.uid]],
            }],
        });

        await this.attachment.originThread.fetchAttachments.bind(this.attachment.originThread)();
    },

    async onUnlike(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        await this.env.services.rpc({
            model: 'ir.attachment',
            method: 'write',
            args: [[this.attachment.id], {
                favorite_users_ids: [[3, this.env.session.uid]],
            }],
        });

        await this.attachment.originThread.fetchAttachments.bind(this.attachment.originThread)();
    },

    _onCopyLink(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (navigator.clipboard) {
          // поддержка имеется, включить соответствующую функцию проекта.
          navigator.clipboard.writeText(this.attachmentUrl);
        } else {
          // поддержки нет. Придётся пользоваться execCommand или не включать эту функцию.
          console.log("Browser dont support copy navigator");
        }
    },

    async _onCopyLinkWithToken(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (navigator.clipboard) {
            console.log(this)
            let odoo_url = this.attachmentUrl;
            let access_token = await this._generateAccessToken();
            odoo_url += '&access_token=' + access_token;
            //let url = encodeURIComponent(odoo_url);
            // поддержка имеется, включить соответствующую функцию проекта.
            navigator.clipboard.writeText(odoo_url);
        } else {
            // поддержки нет. Придётся пользоваться execCommand или не включать эту функцию.
            console.log("Browser dont support copy navigator");
        }
    },

    onOpenNewTab(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        window.open(this.attachmentUrlNoDownload(), '_blank');
    },
        
    onQRcode(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.state.hasQrcodeDialog = true;
    },

    _onQrcodeDialogClosed(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.state.hasQrcodeDialog = false;
    },

    async _generateAccessToken() {
        let access_token = await this.env.services.rpc({
            model: 'ir.attachment',
            method: 'generate_access_token',
            args: [
                [this.attachment.id]
            ],
        })
        return access_token;
    },

    async onPreviewMSAttachment(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        let odoo_url = this.attachmentUrl;
        if (this.attachment.type != 'url' && !this.attachment.public){
            let access_token = await this._generateAccessToken();
            odoo_url += '&access_token=' + access_token;
        }

        var url = 'https://view.officeapps.live.com/op/embed.aspx?src='+ encodeURIComponent(odoo_url);
        if (this.attachment.type === 'url')
            url = this.attachment.url;
            
        window.open(url, '_blank');
    },

    async onPreviewGoogleAttachment(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        let odoo_url = this.attachmentUrl;
        if (this.attachment.type != 'url' && !this.attachment.public){
            let access_token = await this._generateAccessToken();
            odoo_url += '&access_token=' + access_token;
        }

        var url = 'https://docs.google.com/viewer?url='+ encodeURIComponent(odoo_url);
        if (this.attachment.type === 'url')
            url = this.attachment.url;

        window.open(url, '_blank');
    },

    async _downloadAttachmentFromOdoo(attachment) {
        let def = $.Deferred();
        let url = this.attachmentUrl;
        let headers = {};
        fetch(url, headers).then( response =>{
            response.blob().then( blob =>{
                def.resolve(blob);
            })
        })
        return def;
    },


    async onPreviewEmbededGoogleAttachment(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        let odoo_url = this.attachmentUrl;
        if (this.attachment.type != 'url' && !this.attachment.public){
            let access_token = await this._generateAccessToken();
            odoo_url += '&access_token=' + access_token;
        }

        if (this.attachment.type === 'url') {
            this.state.urlPreview = this.attachment.url;
            // change drive to docs for edit
            if (this.state.urlPreview.indexOf('https://drive.google.com/file') != -1){
                if (this.attachment.mimetype.indexOf('spreadsheet') != -1)
                    this.state.urlPreview = this.state.urlPreview.replace('https://drive.google.com/file', 'https://docs.google.com/spreadsheets')
                else if (this.attachment.mimetype.indexOf('wordprocessingml') != -1)
                    this.state.urlPreview = this.state.urlPreview.replace('https://drive.google.com/file', 'https://docs.google.com/document')
                else
                    this.state.urlPreview = this.state.urlPreview.replace('https://drive.google.com/file', 'https://docs.google.com/file')
            }
        }
        else
            this.state.urlPreview = 'https://docs.google.com/gview?url=' + encodeURIComponent(odoo_url) + '&embedded=true';

        $('body').addClass('split-am');
        $('body').addClass('left-am');
    },

    async onPreviewEmbededMSAttachment(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        let odoo_url = this.attachmentUrl;
        if (this.attachment.type != 'url' && !this.attachment.public){
            let access_token = await this._generateAccessToken();
            odoo_url += '&access_token=' + access_token;
        }

        if (this.attachment.type === 'url')
            this.state.urlPreview = this.attachment.url;
        else
            this.state.urlPreview = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(odoo_url);
        $('body').addClass('split-am');
        $('body').addClass('left-am');
    },

    _onCloseSplitScreenPreview(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.state.urlPreview = false;
        $('body').removeClass('split-am');
        $('body').removeClass('left-am');
    },
        /**
     * Return the url of the attachment. Temporary attachments, a.k.a. uploading
     * attachments, do not have an url.
     *
     * @returns {string}
     */
         get attachmentUrl() {
            return this.env.session.url('/web/content', {
                id: this.attachmentCard.attachment.id,
                download: true,
            });
        },
        /**
     * Get the attachment representation style to be applied
     *
     * @returns {string}
     */
         get imageStyle() {

            if (this.attachmentCard.attachment.mimetype.split('/')[0] !== 'image') {
                return 'width:100px;height:100px';
            }
            if (this.env.isQUnitTest) {
                // background-image:url is hardly mockable, and attachments in
                // QUnit tests do not actually exist in DB, so style should not
                // be fetched at all.
                return '';
            }
            let size;
            if (this.props.detailsMode === 'card') {
                size = '38x38';
            } else {
                // The size of background-image depends on the props.imageSize
                // to sync with width and height of `.o_Attachment_image`.
                if (this.props.imageSize === "large") {
                    size = '400x400';
                } else if (this.props.imageSize === "medium") {
                    size = '200x200';
                } else if (this.props.imageSize === "small") {
                    size = '100x100';
                }
            }
            // background-size set to override value from `o_image` which makes small image stretched
            return `background-image:url(/web/image/${this.attachmentCard.attachment.id}/${size}); background-size: auto;`;
        }

});

registerFieldPatchModel('mail.attachment','attachments_manager/static/src/components/attachment_custom/attachment_custom_fields.js', {
    create_uid: attr(),
    create_date: attr(),
    file_size: attr(),
    public: attr(),
    is_favorite: attr(),
    website_visible: attr(),
    tag_ids: attr(),
})
registerClassPatchModel('mail.attachment','attachments_manager/static/src/components/attachment_custom/attachment_custom_static.js', {
    /**
     * @override
     */
    convertData(data) {
            const data2 = this._super(data);
            if ('create_uid' in data)
                data2.create_uid = data.create_uid;
            if ('create_date' in data)
                data2.create_date = data.create_date;
            if ('file_size' in data)
                data2.file_size = human_size(data.file_size);
            if ('public' in data)
                data2.public = data.public;
            if ('type' in data)
                data2.type = data.type;
            if ('url' in data)
                data2.url = data.url;
            if ('is_favorite' in data)
                data2.is_favorite = data.is_favorite;
            if ('website_visible' in data)
                data2.website_visible = data.website_visible;
            if ('tag_ids' in data)
                data2.tag_ids = data.tag_ids;

            return data2;
    }
})

registerInstancePatchModel('mail.attachment', 'attachments_manager/static/src/components/attachment_custom/attachment_custom_instance.js', {
_computeIsViewable() {
    const isViewable = this._super();
    if (!isViewable)
        switch (this.mimetype) {
            // docx
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            // xlsx
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            case 'application/vnd.ms-excel':
            return true;
        }
    return isViewable
},

})
Object.assign(AttachmentCard, {
    components:{
        AttachmentQrcodeDialog:AttachmentQrcodeDialog,
        AttachmentSidebar:AttachmentSidebar,
        Dialog: Dialog
    },
    props: {
        attachmentCardLocalId: String,
        detailsMode: {
            type: String,
            // validate: prop => ['auto', 'card', 'hover', 'none'].includes(prop),
        },
        imageSize: {
            type: String,
            // validate: prop => ['small', 'medium', 'large'].includes(prop),
        },
    },
});
// const components = { AttachmentCard };
// components.AttachmentCard.props.importFromFavoritesEnable =  {
//             type: Object,
//             optional: true,
//         };
// components.AttachmentCard.components.AttachmentQrcodeDialog = AttachmentQrcodeDialog;
// components.AttachmentCard.components.AttachmentSidebar = AttachmentSidebar;
//AttachmentList.components.Attachment = CustomAttachment;

//return CustomAttachment;

