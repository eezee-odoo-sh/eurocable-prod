/** @odoo-module */

import { AttachmentImage } from '@mail/components/attachment_image/attachment_image';
import { AttachmentQrcodeDialog } from 'attachments_manager/static/src/components/attachment_qrcode/attachment_qrcode.js';
import { AttachmentSidebar } from 'attachments_manager/static/src/components/attachment_slider/attachment_slider.js';
import { patch } from 'web.utils';
const { useState } = owl;

patch(AttachmentImage.prototype, 'attachments_manager/static/src/components/attachment_image_custom/attachment_image_custom.js', {
    async willStart(...args) {
        this._super(...args);
        this.state = useState({
            attachment: null,
            isMobile: (window.innerWidth <= 768),
            hasQrcodeDialog: false,
            urlPreview: false,
            magicPreviewId: false
        });
        this.attachment = this.attachmentImage.attachment
    },

    willUnmount(){
        $(this.el).contextMenu( 'destroy' );
        if (this.attachmentImage)
            this.el.removeEventListener('dblclick', this.attachmentImage.onClickImage, true);
    },

    mounted(){
        console.log(this)
        if (this.attachmentImage)
            this.el.addEventListener('dblclick', this.attachmentImage.onClickImage, true);
        let self = this;
        let menu = {
            selector: '.o_attachmentImage, .AttachmentKanbanInfo, .o_AttachmentImage',
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
                                "onClickImage": {name: "Preview offlain", icon: "fa-eye", disabled: function(){ return false; }},
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

    onClickImage(){
        this.attachmentImage.onClickImage();
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
            this.trigger('o-attachment-removed', { attachmentImageLocalId: this.props.attachmentImageLocalId });
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

    get attachmentUrl() {
        return this.env.session.url('/web/content', {
            id: this.attachmentImage.attachment.id,
            download: true,
        });
    },

    onClickDownload() {
        console.log(this.attachmentUrl)
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', this.attachmentUrl);
        // Adding 'download' attribute into a link prevents open a new tab or change the current location of the window.
        // This avoids interrupting the activity in the page such as rtc call.
        downloadLink.setAttribute('download','');
        downloadLink.click();
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
     * Get the attachment representation style to be applied
     *
     * @returns {string}
     */
         get imageStyle() {

            if (this.attachmentImage.attachment.mimetype.split('/')[0] !== 'image') {
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
            return `background-image:url(/web/image/${this.attachmentImage.attachment.id}/${size}); background-size: auto;`;
        }

});

Object.assign(AttachmentImage, {
    components:{
        AttachmentQrcodeDialog:AttachmentQrcodeDialog,
        AttachmentSidebar:AttachmentSidebar
    },

});

