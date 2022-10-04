/** @odoo-module */

import { FileUploader } from '@mail/components/file_uploader/file_uploader';
import { patch } from 'web.utils';

patch(FileUploader.prototype, 'attachments_manager/static/src/components/file_uploader_custom/file_uploader.js', {
    async uploadFiles(files) {
        if (this.env.session.am_compress_jpeg){
            let compress_files = [...files];
            for (let i = 0; i < compress_files.length; i++)
                if (compress_files[i].type === 'image/jpeg' ||
                    compress_files[i].type === 'image/png' ||
                    compress_files[i].type === 'image/webp')
                    compress_files[i] = await this.compress(compress_files[i]);
            files = compress_files;
        }
        // TODO super
        await this._performUpload({
          composer: this.composerView && this.composerView.composer,
          files,
          thread: this.thread,
      });
      this._fileInputRef.el.value = '';
    },

    async compress(file) {
      let def = $.Deferred();
      //const width = 500;
      //const height = 300;
      const quality = this.env.session.am_compress_jpeg_quality;
      const fileName = file.name;
      const fileType = file.type;
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = event => {
        const img = new Image();

        img.src = event.target.result;
        img.onload = () => {
          const elem = document.createElement('canvas');
          //elem.width = img.width;
          //elem.height = img.height;
          elem.width = img.naturalWidth;
          elem.height = img.naturalHeight;
          
          const ctx = elem.getContext('2d');
          // img.width и img.height будет содержать оригинальные размеры
          //ctx.drawImage(img, 0, 0, img.width, img.height);
          ctx.drawImage(img, 0, 0);
          ctx.canvas.toBlob((blob) => {
            const file = new File([blob], fileName, {
              type: fileType,
              lastModified: Date.now()
            });
            def.resolve(file);

          }, fileType, parseFloat(quality));
        };
        reader.onerror = error => console.log(error);
      };
      return def;
    }
});  

