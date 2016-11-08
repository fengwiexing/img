$(function () {

    (function ($) {
        function gLightbox(options) {
            //初始化数据
            this.init();
            //获取要启用lightbox的图片
            this.getData();
            //默认动画速度
            this.options = {
                popupSpeed: 500,
                showSpeed: 300,
                fadeOutSpeed: 300,
            };
            //重置默认的参数
            $.extend(this.options, options || {});
            //关闭Lightbox
            this.closeLightbox();
            //点击左右按钮
            this.clickBtn();
        }
        gLightbox.prototype = {
            //初始化数据
            init: function () {
                this.Glightboxmask = $('<div id="G-lightbox-mask" ></div>');//蒙板
                var createEle = $(
                       ' <div id="G-lightbox-popup"> ' +
                         ' <div class="G-lightbox-view">' +
                            '  <img class="G-lightbox-imags" src="新文件夹1/loading.gif" />' +
                             ' <a href="javascript:" class="G-lightbox-btn G-lightbox-prev "></a>' +
                             ' <a href="javascript:" class="G-lightbox-btn G-lightbox-next "></a>' +
                         ' </div>' +
                          '<div class="G-lightbox-caption">' +
                           '   <p class="G-lightbox-imags-title">图片的描述</p>' +
                            '  <p class="G-lightbox-imags-index">当前图片的索引：0 共 4 张</p>' +
                            '  <span class="G-lightbox-close"></span>' +
                         ' </div>' +
                     ' </div> '
                    );//整个弹窗
                $('body').append(this.Glightboxmask, createEle);//把蒙板的 弹窗增加到body；
                this.winHeight = $(window).height();

                this.popup = $("#G-lightbox-popup");//弹窗
                this.imags = $(".G-lightbox-imags");//图片
                this.prev = $(".G-lightbox-prev");//左按钮
                this.next = $(".G-lightbox-next");//右按钮
                this.caption = $(".G-lightbox-caption");
                this.imagsTitle = $(".G-lightbox-imags-title");//图片标题
                this.showIndex = $(".G-lightbox-imags-index");//图片索引
                this.close = $(".G-lightbox-close");//关闭按钮
            },
            //获取要启用lightbox的图片
            getData: function () {
                var self = this;
                self.enabledLightboxImags = [];

                $(".enabled-lightbox").click(function () {//绑定页面图片点击事件
                    self.imagsID = $(this).attr('data-lightbox-id');
                    var groups = $(this).attr('data-lightbox-groups');

                    if (self.enabledLightboxImags.length == 0 || self.enabledLightboxImags[0].ImagsGroups != groups) {

                        self.enabledLightboxImags.length = 0;
                        $(".enabled-lightbox").each(function () {
                            if ($(this).attr('data-lightbox-groups') == groups) {//获取同一组的图片
                                self.enabledLightboxImags.push({
                                    ImagsTitle: $(this).attr('data-lightbox-title'),
                                    ImagsSrc: $(this).attr('data-lightbox-src'),
                                    ImagsId: $(this).attr('data-lightbox-id'),
                                    ImagsGroups: groups,
                                })
                            }
                        })

                    }
                    var src = self.enabledLightboxImags;
                    var l = self.imagsLength = self.enabledLightboxImags.length;
                    for (var i = 0; i < l; i++) {
                        if (src[i].ImagsId == self.imagsID) {
                            self.imagsIndex = i;
                        };
                    }
                    self.showMask();
                    self.showbtn();
                    self.winAdjustSiez();
                })
            },
            //显示遮罩
            showMask: function () {
                var scrollMask = this.Glightboxmask;
                scrollMask.css("top", $(window).scrollTop()).show()
                $(window).on('scroll.mask', function () {
                    scrollMask.css("top", $(this).scrollTop());
                });
                this.showPopup();
            },
            //显示弹窗；
            showPopup: function () {
                var self = this;
                this.caption.hide();
                var popup = this.popup;

                popup.css({ 'top': -this.winHeight, 'marginTop': -popup.outerHeight() / 2 }).show().animate({ 'top': '50%' }, this.options.popupSpeed, function () {

                    self.loadImags(self.imagsIndex);
                });

            },
            //加载图片
            loadImags: function (index) {
                var self = this;
                var src = this.enabledLightboxImags[index].ImagsSrc;
                var imag = new Image();
                imag.src = src;
                if (!!window.ActiveXObject) {
                    imag.onreadystatechange = function () {
                        if (this.readyState == 'complete') {
                            self.getImgsize(src);
                        }
                    }
                } else {
                    imag.onload = function () {
                        self.getImgsize(src);
                    }
                }

            },
            //获取图片大小
            getImgsize: function (src) {
                var img = this.imags;
                img.attr('src', src);
                var imgW = img.width();
                var imgH = img.height();
                this.getPopupSize(imgW, imgH);
            },
            //根据图片大小设置弹窗的大小
            getPopupSize: function (imgW, imgH) {
                var self = this,
                    winWidth = $(window).width(),
                  winHeight = $(window).height();
                var rate = Math.min(winWidth / (imgW + 10), winHeight / (imgH + 10), 1);

                imgW = imgW * rate;
                imgH = imgH * rate;

                this.imags.css({ width: imgW, height: imgH });
                this.popup.animate({ 'marginTop': -imgH / 2 - 5, width: imgW, height: imgH }, this.options.showSpeed, function () {
                    self.imags.fadeIn();
                    self.caption.show();
                    self.imagsTitle.text("图片描述: " + self.enabledLightboxImags[self.imagsIndex].ImagsTitle);
                    self.showIndex.text("当前图片的索引：" + (self.imagsIndex + 1) + " 共 " + self.imagsLength + " 张");
                    self.clickBool = true;
                });
            },
            //调整窗口动态改变弹窗大小
            winAdjustSiez: function () {
                var self = this;
                var setOut = null;
                $(window).resize(function () {
                    clearTimeout(setOut);
                    setOut = setTimeout(function () {
                        self.resetImags(function () {
                            self.loadImags(self.imagsIndex);
                        })
                    }, 100);

                })
            },
            //按钮显示操作
            showbtn: function () {
                var self = this;
                if (this.enabledLightboxImags.length > 1) {

                    if (self.imagsIndex < 1) {
                        self.controlPrevBtn(true);
                        self.controlNextBtn(false);
                    } else if (self.imagsIndex >= self.imagsLength - 1) {
                        self.controlNextBtn(true);
                        self.controlPrevBtn(false);
                    } else {
                        self.controlNextBtn(false);
                        self.controlPrevBtn(false);
                    }

                } else {
                    self.controlPrevBtn(true);
                    self.controlNextBtn(true);
                }

            },
            //按钮点击操作
            clickBtn: function () {

                var self = this;
                this.prev.click(function () {
                    if (self.clickBool) {
                        self.resetImags(function () {
                            self.loadImags(--self.imagsIndex);
                            self.showbtn();
                        })
                    }
                    self.clickBool = false;
                })

                this.next.click(function () {

                    if (self.clickBool) {
                        self.resetImags(function () {
                            self.loadImags(++self.imagsIndex);
                            self.showbtn();
                        })
                    }
                    self.clickBool = false;
                })

            },
            //控制prev按钮显示
            controlPrevBtn: function (bol) {
                if (bol) {
                    this.prev.addClass("disabledBtn");
                } else {
                    this.prev.removeClass("disabledBtn");

                    this.prev.hover(function () {
                        $(this).addClass("G-lightbox-prev-btn-show");
                    }, function () {
                        $(this).removeClass("G-lightbox-prev-btn-show");
                    });
                }
            },
            //控制next按钮显示
            controlNextBtn: function (bol) {
                if (bol) {
                    this.next.addClass("disabledBtn");

                } else {
                    this.next.removeClass("disabledBtn");

                    this.next.hover(function () {
                        $(this).addClass("G-lightbox-next-btn-show");
                    }, function () {
                        $(this).removeClass("G-lightbox-next-btn-show");
                    });
                }
            },
            //关闭Lightbox
            closeLightbox: function () {
                var self = this;
                this.Glightboxmask.click(function (e) {
                    e.stopPropagation();
                    self.closebox()
                });
                this.close.click(function (e) {
                    e.stopPropagation();
                    self.closebox()
                });
            },
            //蒙板和弹窗淡出，并重置图片宽高
            closebox: function () {
                this.Glightboxmask.fadeOut();
                this.popup.fadeOut(this.options.fadeOutSpeed, function () { $(this).css({ 'width': '50%', 'height': '50%' }) });
                this.resetImags();
            },
            //并重置图片宽高
            resetImags: function (callfn) {
                this.caption.hide();
                this.imags.fadeOut(this.options.fadeOutSpeed, function () {
                    $(this).css({
                        width: 'auto', height: 'auto'
                    });
                    typeof callfn === 'function' && callfn();
                });
            }

        }

        window["gLightbox"] = gLightbox;
    })(jQuery);
 


})