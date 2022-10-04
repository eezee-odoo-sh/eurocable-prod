/** @odoo-module */

import { AttachmentBox } from '@mail/components/attachment_box/attachment_box';

import { patch } from 'web.utils';
const { useState } = owl;
const { useRef } = owl.hooks;

patch(AttachmentBox.prototype, 'attachments_manager/static/src/components/attachment_box_custom/attachment_box_screen_record.js', {
    async willStart(...args) {
        //super(...args);
        this._super(...args);
        this.state = useState({
            recording: null,
            toogleScreencastBar: false
        });
        this.dataChunks = [];
        this.mediaRecorder = null;
        this.screenStream = null;
        this.voiceStream = null;
        this.videoBlob = null;

        this.videoRef = useRef('videoRef');
        this.linkRef = useRef('linkRef');

    },


    async startVideo() {
        if (navigator.mediaDevices.getDisplayMedia) {
            try {
                const _screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true
                })
                this.screenStream = _screenStream
            } catch (e) {
                console.error('*** getDisplayMedia', e)
            }
        } else {
            console.warn('*** getDisplayMedia not supported')
        }
    },

    async startAudio() {
        if (navigator.mediaDevices.getUserMedia) {
            if (this.screenStream) {
                try {
                    const _voiceStream = await navigator.mediaDevices.getUserMedia({
                        audio: true
                    })
                    this.voiceStream = _voiceStream
                } catch (e) {
                    console.error('*** getUserMedia', e)
                    this.voiceStream = 'unavailable';
                } finally {
                }
            }
        } else {
            console.warn('*** getUserMedia not supported')
        }
    },

    startStopButton(ev) {
        if (!this.state.recording) {
            this.startRecording()
        } else {
            if (this.mediaRecorder) {
                this.mediaRecorder.stop()
                this.stopRecording()
            }
        }
    },

    closeButton() {
        this.stopRecording();
        this.videoBlob = null;
        this.state.toogleScreencastBar = false;
    },

    sleep (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    async saveButton() {
        let file = await new File([this.videoBlob], `${Date.now()}-${this.env.session.partner_display_name}.webm`);
        await this._fileUploaderRef.comp.uploadFiles([file]);
        this.closeButton();
        await this.sleep(200);
        this.amThread.refresh();
    },

    stopRecording() {
        this.state.recording = false;

        this.videoBlob = new Blob(this.dataChunks, {
            type: 'video/webm'
        })

        const videoSrc = URL.createObjectURL(this.videoBlob)

        this.videoRef.el.src = videoSrc
        this.linkRef.el.href = videoSrc
        this.linkRef.el.download = `${Date.now()}-${this.env.session.partner_display_name}.webm`

        this.mediaRecorder = null
        this.dataChunks = []
    },

    async startRecording() {
        if (this.screenStream && this.voiceStream && !this.mediaRecorder) {
            this.state.recording = true;

            this.videoRef.el.removeAttribute('src')
            this.linkRef.el.removeAttribute('href')
            this.linkRef.el.removeAttribute('download')

            let mediaStream
            if (this.voiceStream === 'unavailable') {
                mediaStream = this.screenStream
            } else {
                mediaStream = new MediaStream([
                    ...this.screenStream.getVideoTracks(),
                    ...this.voiceStream.getAudioTracks()
                ])
            }

            this.mediaRecorder = new MediaRecorder(mediaStream)
            this.mediaRecorder.ondataavailable = ({ data }) => {
                this.dataChunks.push(data)
            }
            this.mediaRecorder.start(250)
        }

    },
    async _onScreenCast(ev) {
        if (!this.screenStream && !this.voiceStream) {
            // параллельное ожидание запроса на доступы
            // await Promise.all([this.startVideo(), this.startAudio()]);
            await this.startVideo()
            await this.startAudio()
        }
        this.state.toogleScreencastBar = true;
    },

});
export default AttachmentBox;