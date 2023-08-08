setTimeout(() => {

    window.coi = {
        shouldRegister: () => true,
        shouldDeregister: () => false,
        coepCredentialless: () => !(window.chrome || window.netscape),
        doReload: () => window.location.reload(),
        quiet: false
    }

    const { createFFmpeg } = FFmpeg;
    const ffmpeg = createFFmpeg({
        corePath: 'https://xiaomaomi-xj.gitee.io/fishing-exclusive-area/convert-gif/lib/ffmpeg-core.js',
        log: false,
        progress: progressFun
    });

    const maskDownBoxEl = document.querySelector('.mask-down-box');
    const msakDownVideoEl = document.querySelector('.msak-down-video');
    const maskDownBtn = document.querySelector('.mask-down-btn');
    const maskCloseBtn = document.querySelector('.mask-close-btn');
    maskCloseBtn.addEventListener('click', _ => {
        window.location.reload();
    });

    maskDownBtn.addEventListener('click', _ => {
        download(xiaomaomiUrl, "转换后的视频");
    });

    const maskBoxEl = document.querySelector('.mask-box');
    const maskSonEl = document.querySelector('.mask-son');
    const jinduEl = document.querySelector('.jindu');
    let xiaomaomiUrl = '';
    async function convertGif(file, fbl, ping_num, bmgsStyle, spzlStyle, maLv, bpsStyle) {
        let encodeName = encodeURI(file.name);
        const inputFileData = await file.arrayBuffer();
        await ffmpeg.load();
        ffmpeg.FS('writeFile', encodeName, new Uint8Array(inputFileData));
        let outFileName = 'output.mp4';
        const ml = parseInt(maLv);
        if (ping_num === 0 && ml === 0) {
            await ffmpeg.run('-i', encodeName, '-c:v', bmgsStyle, '-crf', spzlStyle, '-s', fbl, '-max_muxing_queue_size', '9999', '-f', 'mp4', outFileName);
        } else if (ping_num === 0) {
            let malv = ml + bpsStyle;
            await ffmpeg.run('-i', encodeName, '-c:v', bmgsStyle, '-crf', spzlStyle, '-s', fbl, '-b:v', malv, '-max_muxing_queue_size', '9999', '-f', 'mp4', outFileName);
        } else if (ml === 0) {
            ping_num = ping_num + "";
            await ffmpeg.run('-i', encodeName, '-c:v', bmgsStyle, '-crf', spzlStyle, '-s', fbl, '-r', ping_num, '-max_muxing_queue_size', '9999', '-f', 'mp4', outFileName);
        } else {
            let malv = ml + bpsStyle;
            ping_num = ping_num + "";
            await ffmpeg.run('-i', encodeName, '-c:v', bmgsStyle, '-crf', spzlStyle, '-s', fbl, '-b:v', malv, '-r', ping_num, '-max_muxing_queue_size', '9999', '-f', 'mp4', outFileName);
        }
        const outputData = ffmpeg.FS('readFile', outFileName);
        maskSonEl.style.top = '0px';
        jinduEl.innerHTML = '100';
        setTimeout(() => {
            maskBoxEl.style.display = 'none';
            xiaomaomiUrl = URL.createObjectURL(new Blob([outputData.buffer], { type: 'video/mp4' }));
            msakDownVideoEl.src = xiaomaomiUrl;
            maskDownBoxEl.style.display = 'flex';
        }, 1000);
    }

    //进度处理
    function progressFun(bg) {
        let ratio = bg['ratio'];
        if (ratio) {
            let perRatio = ratio * 100;
            let jd = perRatio.toFixed(2);
            let topV = parseInt(jd) * 1.5;
            maskSonEl.style.top = (150 - topV) + 'px';
            jinduEl.innerHTML = jd;
        }
    }

    const videoEl = document.querySelector("video");
    const uploadEl = document.querySelector(".upload");
    const createImgEl = document.querySelector(".create-img");
    const fileEl = document.querySelector("input[type='file']");
    const fblWEl = document.querySelector('#fbl-w');
    const fblHEl = document.querySelector('#fbl-h');
    let isSelectVideo = false;
    let isAleryCreate = false;
    let xiaomaomiFile = null;
    //比例
    let rota = 0;
    //选择文件
    uploadEl.addEventListener('click', _ => {
        if (isAleryCreate) {
            window.location.reload();
            return;
        }
        fileEl.click();
    });

    const pingNumEl = document.querySelector('#pingNum');
    const bmgsStyleEl = document.querySelector('.bmgs-style');
    const spzlStyleEl = document.querySelector('.spzl-style');
    const maLvEl = document.querySelector('#ma-lv');
    const bpsStyleEl = document.querySelector('.bps-style');
    //生成
    createImgEl.addEventListener('click', _ => {
        if (!isSelectVideo) {
            alert("请先选择视频文件");
            return;
        }
        isAleryCreate = true;
        let fbl_w = fblWEl.value;
        let fbl_h = fblHEl.value;
        if (parseInt(fbl_w) < 1 || parseInt(fbl_h) < 1) {
            alert("分辨率不得小于1!");
            return;
        }
        if (parseInt(fbl_w) % 2 !== 0 || parseInt(fbl_h) % 2 !== 0) {
            alert("分辨率的宽和高必须可以被2整除！");
            return;
        }
        let fbl = fbl_h + 'x' + fbl_w
        let ping_num = parseInt(pingNumEl.value);
        let bmgsStyle = bmgsStyleEl.value;
        let spzlStyle = spzlStyleEl.value;
        let maLv = maLvEl.value;
        let bpsStyle = bpsStyleEl.value;
        if (isNaN(ping_num) || isNaN(parseInt(maLv))) {
            alert("频率和码率必须为数字！");
            return;
        }
        if (ping_num < 0 || ping_num > 60) {
            alert("帧率不得小于0大于60！");
            return;
        }
        if (parseInt(maLv) < 0) {
            alert("码率不得小于0！");
            return;
        }
        maskBoxEl.style.display = 'flex';
        convertGif(xiaomaomiFile, fbl, ping_num, bmgsStyle, spzlStyle, maLv, bpsStyle);
    });

    //处理选择文件
    fileEl.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file == undefined) {
            //未选择文件，return
            return;
        }
        //视频格式
        const videoStyles = [".avi", ".flv", ".mkv", ".mov", ".mp4", ".webm", ".wmv"];
        //验证是否是视频
        let isVideon = false;
        let fileName = file.name;
        videoStyles.forEach(v => {
            if (fileName.endsWith(v)) {
                isVideon = true;
            }
        });
        if (!isVideon) {
            alert("视频文件【只允许后缀名：avi，flv，mkv，mov，mp4，webm，wmv】！");
            return;
        }
        let fileUrl = URL.createObjectURL(file);
        videoEl.src = fileUrl;
        videoEl.onloadeddata = function () {
            fblWEl.value = videoEl.videoHeight;
            fblHEl.value = videoEl.videoWidth;
            let w = parseInt(videoEl.videoHeight);
            let h = parseInt(videoEl.videoWidth);
            if (w < 1 || h < 1) {
                alert("视频分辨率获取失败【分辨率不得小于1】！");
                return;
            }
            rota = w / h;
            isSelectVideo = true;
            videoEl.style.display = 'block';
            fblWEl.disabled = false;
            fblHEl.disabled = false;
            xiaomaomiFile = file;
        }
    });

    //下载
    function download(url, fileName) {
        if (xiaomaomiUrl == "") {
            alert("视频生成中，请等待...");
            return;
        }
        const a = document.createElement('a')
        // 地址
        a.href = url
        // 修改文件名
        a.download = fileName
        // 触发点击
        document.body.appendChild(a)
        a.click()
        // 移除
        setTimeout(() => document.body.removeChild(a));
    }

    //分辨率监控
    const checkBoxSonEl = document.querySelector('.checkbox-son');
    fblWEl.addEventListener('input', _ => {
        let newV = parseInt(fblWEl.value);
        fblWEl.value = newV;
        let value = fblWEl.value;
        if (value.length === 0) {
            fblWEl.value = 0;
            return;
        }
        if (parseInt(value) > 10000) {
            fblWEl.value = fblWEl.value.substr(0, fblWEl.value.length - 1)
            return;
        }
        if (checkBoxSonEl.classList.contains('check')) {
            fblHEl.value = Math.ceil(parseInt(value) / rota);
        }
    });
    fblHEl.addEventListener('input', _ => {
        let newV = parseInt(fblHEl.value);
        fblHEl.value = newV;
        let value = fblHEl.value;
        if (value.length === 0) {
            fblHEl.value = 0;
            return;
        }
        if (parseInt(value) > 10000) {
            fblHEl.value = fblHEl.value.substr(0, fblHEl.value.length - 1)
            return;
        }
        if (checkBoxSonEl.classList.contains('check')) {
            fblWEl.value = Math.ceil(parseInt(value) * rota);
        }
    });
});