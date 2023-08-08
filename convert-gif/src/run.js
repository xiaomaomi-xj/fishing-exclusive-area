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
    const msakDownImgEl = document.querySelector('.msak-down-img');
    const maskDownBtn = document.querySelector('.mask-down-btn');
    const maskCloseBtn = document.querySelector('.mask-close-btn');
    maskCloseBtn.addEventListener('click', _ => {
        window.location.reload();
    });

    maskDownBtn.addEventListener('click', _ => {
        download(xiaomaomiUrl, "视频转换后的图片");
    });

    const maskBoxEl = document.querySelector('.mask-box');
    const maskSonEl = document.querySelector('.mask-son');
    const jinduEl = document.querySelector('.jindu');
    let xiaomaomiUrl = '';
    async function convertGif(file, start_miao, shi_chang, fbl, ping_num) {
        let encodeName = encodeURI(file.name);
        const inputFileData = await file.arrayBuffer();
        await ffmpeg.load();
        ffmpeg.FS('writeFile', encodeName, new Uint8Array(inputFileData));
        let outFileName = 'output.gif';
        if (start_miao === '0.000' && shi_chang === '0.000') {
            await ffmpeg.run('-i', encodeName, '-s', fbl, '-r', ping_num, '-f', 'gif', outFileName);
        } else {
            await ffmpeg.run('-ss', start_miao, '-i', encodeName, '-t', shi_chang, '-s', fbl, '-r', ping_num, '-f', 'gif', outFileName);
        }
        const outputData = ffmpeg.FS('readFile', outFileName);
        maskSonEl.style.top = '0px';
        jinduEl.innerHTML = '100';
        setTimeout(() => {
            maskBoxEl.style.display = 'none';
            xiaomaomiUrl = URL.createObjectURL(new Blob([outputData.buffer], { type: 'image/gif' }));
            msakDownImgEl.src = xiaomaomiUrl;
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
    //视频时长
    let videoTime = 0;
    //选择文件
    uploadEl.addEventListener('click', _ => {
        if (isAleryCreate) {
            window.location.reload();
            return;
        }
        fileEl.click();
    });

    //开始时间和时长
    const startMiaoEl = document.querySelector('#startMiao');
    const shiChangEl = document.querySelector('#shiChang');
    const pingNumEl = document.querySelector('#pingNum');
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
        let start_miao = parseFloat(startMiaoEl.value).toFixed(3);
        let shi_chang = parseFloat(shiChangEl.value).toFixed(3);
        if (start_miao !== '0.000' && shi_chang === '0.000') {
            alert("截取时长只有在截取整个的视频的时候可以为0！");
            return;
        }
        let total = parseFloat(start_miao) + parseFloat(shi_chang);
        if (total.toFixed(3) > videoTime) {
            alert("开始时间加时长不得超过视频时长！");
            return;
        }
        let ping_num = parseInt(pingNumEl.value);
        if (isNaN(ping_num)) {
            alert("频率和码率必须为数字！");
            return;
        }
        if (ping_num < 1 || ping_num > 60) {
            alert("帧率不得小于1大于60！");
            return;
        }
        maskBoxEl.style.display = 'flex';
        convertGif(xiaomaomiFile, start_miao, shi_chang, fbl, ping_num.toString());
    });

    //处理选择文件
    fileEl.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file == undefined) {
            //未选择文件，return
            return;
        }
        //视频格式
        const videoStyles = [".mp4"];
        //验证是否是视频
        let isVideon = false;
        let fileName = file.name;
        videoStyles.forEach(v => {
            if (fileName.endsWith(v)) {
                isVideon = true;
            }
        });
        if (!isVideon) {
            alert("视频文件【只允许后缀名：mp4】！");
            return;
        }
        let fileUrl = URL.createObjectURL(file);
        videoEl.src = fileUrl;
        videoEl.onloadeddata = function () {
            let spcd = videoEl.duration
            if (isNaN(spcd) || spcd === Infinity || spcd === 0 || spcd === undefined || spcd === null) {
                alert("视频长度获取失败【请不要直接修改后缀名，可以把其他格式的视频转换为mp4格式后再使用】！");
                return;
            }
            fblWEl.value = videoEl.videoHeight;
            fblHEl.value = videoEl.videoWidth;
            let w = parseInt(videoEl.videoHeight);
            let h = parseInt(videoEl.videoWidth);
            if (w < 1 || h < 1) {
                alert("视频分辨率获取失败【分辨率不得小于1】！");
                return;
            }
            videoTime = spcd;
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
            alert("照片生成中，请等待...");
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