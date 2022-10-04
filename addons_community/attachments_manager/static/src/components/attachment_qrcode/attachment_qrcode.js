odoo.define('attachments_manager/static/src/components/attachment_qrcode/attachment_qrcode.js', function (require) {
'use strict';

const components = {
    Dialog: require('web.OwlDialog'),
};

const { Component } = owl;
const { useRef, useStore } = owl.hooks;

class AttachmentQrcodeDialog extends Component {

    /**
     * @override
     */
    constructor(...args) {
        super(...args);
        useStore(props => {
            const attachment = this.env.models['mail.attachment'].get(props.attachmentLocalId);
            return {
                attachment: attachment ? attachment.__state : undefined,
            };
        });
        // to manually trigger the dialog close event
        this._dialogRef = useRef('dialog');
        this._qrcodeDiv = useRef('qrcode');
        
    }

    get attachmentUrlNoDownload() {
        if (this.attachment.isTemporary) {
            return '';
        }
        return this.env.session.url('/web/content', {
            id: this.attachment.id,
        });
    }

    mounted(){
        new QRCode(this._qrcodeDiv.el, this.attachmentUrlNoDownload);
    }
    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * @returns {mail.attachment}
     */
    get attachment() {
        return this.env.models['mail.attachment'].get(this.props.attachmentLocalId);
    }

    /**
     * @returns {string}
     */
    getBody() {
        return _.str.sprintf(
            this.env._t(`You can quick share`),
            owl.utils.escape(this.attachment.displayName)
        );
    }

    /**
     * @returns {string}
     */
    getTitle() {
        return this.env._t("Attachments manager QRcode");
    }

    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

    /**
     * @private
     */
    _onClickCancel(ev) {
        console.log("close in dialog")
        ev.stopPropagation();
        ev.preventDefault();
        this._dialogRef.comp._close();
    }

}

Object.assign(AttachmentQrcodeDialog, {
    components,
    props: {
        attachmentLocalId: String,
    },
    template: 'mail.AttachmentQrcodeDialog',
});

return AttachmentQrcodeDialog;

});
