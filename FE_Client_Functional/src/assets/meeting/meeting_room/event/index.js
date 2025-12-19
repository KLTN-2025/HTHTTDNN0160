export const initEvents = () => {
    const btnEmoji = document.querySelector("#emoji");
    const btnCaption = document.querySelector("#caption");
    const caption = document.querySelector(".caption-section");
    const emoji = document.querySelector(".emoji-section");
    const btnChat = document.querySelector("#btn-chat");
    const btnUser = document.querySelector("#btn-user");
    const infoPanel = document.querySelector(".info-panel");
    const optionDevice = document.querySelector(".box-option");
    const btnShowDevice = document.querySelectorAll(".option-device-btn");
    const btnShowBoxOption = document.querySelectorAll(".box-option-item");
    const listOption = document.querySelector(".list-option");

    btnEmoji.addEventListener("click", () => {
        emoji.classList.toggle("show-emoji");
    })

    btnCaption.addEventListener("click", () => {
        caption.classList.toggle("show-caption");
    })

    btnShowDevice.forEach(item => {
        item.addEventListener("click", (e) => {
            optionDevice.classList.toggle("show");
            e.stopPropagation();
        });
    })

    optionDevice.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.addEventListener("click", () => {
        optionDevice.classList.remove("show");
        listOption.classList.remove("show");
    });

    btnShowBoxOption.forEach(item => {
        item.addEventListener("click", (e) => {
            if (!listOption.classList.contains("show")) {
                listOption.classList.add("show")
            } else {
                listOption.classList.remove("show")
            }
            e.stopPropagation();
        });
    })

    listOption.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
        document.querySelectorAll(".cs-select").forEach(select => {
            if (!select.contains(e.target)) {
                select.classList.remove("open");
            }
        });
    });

    document.querySelectorAll(".cs-select").forEach(select => {
        const btn = select.querySelector(".cs-btn");
        const label = select.querySelector(".cs-label");
        const items = select.querySelectorAll(".cs-item");

        btn.onclick = () => {
            select.classList.toggle("open");
        };

        items.forEach(item => {
            item.onclick = () => {
                items.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                label.textContent = item.textContent;
                select.dataset.value = item.dataset.value;

                select.classList.remove("open");

                // hook chỗ này nếu cần
                // console.log("selected:", item.dataset.value);
            };
        });
    });

}

