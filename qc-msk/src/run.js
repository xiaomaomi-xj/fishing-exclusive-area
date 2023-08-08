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
        download(xiaomaomiUrl, "去除马赛克后的视频");
    });

    const maskBoxEl = document.querySelector('.mask-box');
    const maskSonEl = document.querySelector('.mask-son');
    const jinduEl = document.querySelector('.jindu');
    let xiaomaomiUrl = '';
    async function removeMosaic(file) {
        let encodeName = encodeURI(file.name);
        const inputFileData = await file.arrayBuffer();
        await ffmpeg.load();
        ffmpeg.FS('writeFile', encodeName, new Uint8Array(inputFileData));
        let outFileName = 'output.mp4';
        await ffmpeg.run('-i', encodeName, '-filter:v', "minterpolate='mi_mode=mci:mc_mode=aobmc:mb_size=8'", '-c:a', 'copy', '-f', 'mp4', outFileName);
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
            //不要直接满
            if(ratio === 1){
                ratio = 0.9999;
            }
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
    let isSelectVideo = false;
    let isAleryCreate = false;
    let xiaomaomiFile = null;
    //选择文件
    uploadEl.addEventListener('click', _ => {
        if (isAleryCreate) {
            window.location.reload();
            return;
        }
        fileEl.click();
    });

    //生成
    createImgEl.addEventListener('click', _ => {
        if (!isSelectVideo) {
            alert("请先选择视频文件");
            return;
        }
        isAleryCreate = true;
        maskBoxEl.style.display = 'flex';
        removeMosaic(xiaomaomiFile);
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
            isSelectVideo = true;
            videoEl.style.display = 'block';
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
});