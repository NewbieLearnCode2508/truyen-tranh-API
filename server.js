const express = require("express");
const dotenv = require("dotenv");
const bodyParse = require("body-parser");
const cors = require("cors");
const cheerio = require("cheerio");
const { default: axios } = require("axios");

const app = express();

dotenv.config();
app.use(cors());
app.use(bodyParse.json({ limit: "50mb" }));
bodyParse.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
});

const domainUrl = "http://localhost:8000/";

console.log("server is running....");

//Lấy danh sách truyện
app.get("/truyen-tranh", (req, resp) => {
    try {
        const urlTruyenTranh = "https://toptruyen.net/tim-truyen";
        axios(urlTruyenTranh).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);

            const truyenTranh = [];

            $(
                ".main > .container .content-search-left .main-left .row .item-manga"
            ).each(function () {
                const nameTruyen = $(this)
                    .find(".item .caption .title-manga")
                    .text();
                const idTruyen = $(this)
                    .find(".item .caption .title-manga")
                    .attr("data-id");
                const imgTruyen = $(this)
                    .find(".item .image-item img")
                    .attr("src");
                const crawlUrl = $(this)
                    .find(".item .caption .title-manga")
                    .attr("href");
                const secondUrl = crawlUrl.split(
                    "https://toptruyen.net/truyen-tranh/"
                );
                const urlTruyen = secondUrl[secondUrl.length - 1].split(
                    `/${idTruyen}`
                )[0];

                truyenTranh.push({
                    nameTruyen,
                    urlTruyen:
                        domainUrl +
                        "truyen-tranh/" +
                        urlTruyen +
                        "/" +
                        idTruyen,
                    imgTruyen,
                    idTruyen,
                });
            });
            resp.status(200).json(truyenTranh);
        });
    } catch (error) {
        resp.status(500).json(error);
    }
});

//Lấy thông tin truyện
app.get("/truyen-tranh/:tenTruyen/:idTruyen", (req, resp) => {
    try {
        const urlChiTietTruyen = `https://toptruyen.net/truyen-tranh/${req.params.tenTruyen}/${req.params.idTruyen}`;
        console.log(urlChiTietTruyen);
        axios(urlChiTietTruyen).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);

            const thongTinTruyen = [];
            $("#comic-detail .content-left").each(function () {
                const nameTruyen = $(this).find(".title-manga").text();
                const updateDay = $(this).find(".time-update").text();
                let imgUrl = "";
                let ratingStar = "";
                let orderName = "";
                let author = "";
                let status = "";
                let category = [];
                let translateGroup = "";
                let viewTotal = "";
                let viewLike = "";
                let totalFollow = "";
                let listChapter = [];
                $(this)
                    .find(".overview-comic")
                    .each(function () {
                        imgUrl = $(this)
                            .find(".comic-left > .image-info > .image-comic")
                            .attr("src");
                        ratingStar = $(this)
                            .find(".comic-left > .rating .star")
                            .attr("data-rating");
                        $(this)
                            .find(".comic-right")
                            .each(function () {
                                orderName = $(this)
                                    .find(".name-other .detail-info")
                                    .text();
                                author = $(this)
                                    .find(".author .detail-info")
                                    .text();
                                status = $(this)
                                    .find(".status .detail-info > span")
                                    .text();
                                translateGroup = $(this)
                                    .find(".translate-group .detail-info")
                                    .text();
                                viewTotal = $(this)
                                    .find(".view-total .detail-info")
                                    .text();
                                viewLike = $(this)
                                    .find(".view-like .detail-info")
                                    .text();
                                totalFollow = $(this)
                                    .find(".total-follow .detail-info > b")
                                    .text();
                                $(this)
                                    .find(".category .cat-detail")
                                    .each(function () {
                                        category.push($(this).find("a").text());
                                    });
                            });
                    });
                $(this)
                    .find(".list-chapter nav ul .chapters")
                    .each(function () {
                        const nameChap = $(this)
                            .find(".chapter")
                            .attr("data-chapter");
                        const idChap = $(this).find(".chapter").attr("data-id");
                        const linkChap = `${domainUrl}truyen-tranh/${req.params.tenTruyen}/chapter-${nameChap}/${idChap}`;
                        if (idChap !== "9999")
                            listChapter.push({
                                nameChap,
                                idChap,
                                linkChap,
                            });
                    });
                thongTinTruyen.push({
                    nameTruyen,
                    updateDay,
                    imgUrl,
                    ratingStar,
                    orderName,
                    author,
                    status,
                    category,
                    translateGroup,
                    viewTotal,
                    viewLike,
                    totalFollow,
                    listChapter,
                });
            });
            resp.status(200).json(thongTinTruyen);
        });
    } catch (error) {
        resp.status(500).json(error);
    }
});

//Lấy ảnh truyện
app.get("/truyen-tranh/:tenTruyen/:chapter/:idChap", (req, resp) => {
    try {
        const urlTruyen = `https://toptruyen.net/truyen-tranh/${req.params.tenTruyen}/${req.params.chapter}/${req.params.idChap}`;
        axios(urlTruyen).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            const listImgChapter = [];
            $(".list-image-detail .page-chapter").each(function () {
                const imgUrl = $(this).find("img").attr("src");
                const idTrang = $(this).find("img").attr("data-index");
                listImgChapter.push({
                    imgUrl,
                    idTrang,
                });
            });
            resp.status(200).json(listImgChapter);
        });
    } catch (error) {
        resp.status(500).json(error);
    }
});

app.listen(8000);
