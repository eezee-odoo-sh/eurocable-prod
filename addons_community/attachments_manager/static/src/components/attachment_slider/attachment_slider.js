odoo.define('attachments_manager/static/src/components/attachment_slider/attachment_slider.js', function (require) {
'use strict';

const { Component } = owl;

class AttachmentSidebar extends Component {
    constructor(...args) {
        super(...args);
        this._onClickCaptureGlobal = this._onClickCaptureGlobal.bind(this);
    }

    mounted() {
        document.addEventListener('click', this._onClickCaptureGlobal, true);
        this.el.addEventListener('mousewheel', this._onMouseWheel, true);
    }

    willUnmount() {
        document.removeEventListener('click', this._onClickCaptureGlobal, true);
        this.el.removeEventListener('mousewheel', this._onMouseWheel, true);
    }

    _onClickCaptureGlobal(ev) {
        var div = $(this.el); // тут указываем ID элемента
        // если клик был не по нашему блоку
        if (!div.is(ev.target) && div.has(ev.target).length === 0) { // и не по его дочерним элементам
            this._onCloseSidebar(ev); // скрываем его
        }
    }

    _onCloseSidebar(ev) {
        // console.log("CloseSidebar");
        this.trigger('toggle-sidebar');
    }

    _onMouseWheel(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var delta = Math.max(-1, Math.min(1, (ev.deltaY || ev.detail || ev.wheelDelta)));
        this.scrollLeft = (this.scrollLeft + delta*10);
    }
 }

Object.assign(AttachmentSidebar, {
    defaultProps: {
        attachment: null,
    },
    template: 'attachments_manager.AttachmentSidebar'
});

return AttachmentSidebar;

});
