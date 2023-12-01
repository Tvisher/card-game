class CardsGame {
    constructor(data) {
        this.saveDesctopProportions = data.gameData.saveDesctopProportions;
        this.cardImages = data.gameData.cardImages;
        this.cardsText = data.gameData.cardsText;
        this.cardsCount = this.cardImages.length;
        this.arrowType = data.gameData.arrowType;
        this.resultMessage = data.gameData.resultMessage;
        this.parentElement = document.querySelector(data.parentElement);
        this.gridPlace = document.createElement('div');
        this.modalPrompt = document.createElement('div');
        this.modalResult = document.createElement('div');
        this.cardsArr = [];
        this.correctOrder = this.cardImages.map((item, index) => String(index + 1)).join('');
        this.windowListener = this.getElementsPosition.bind(this);
        this.clickListener = this.clickLoader.bind(this);
        this.addEventListeners();
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    createCardsParent() {
        this.parentElement.innerHTML = '';
        this.gridPlace.classList.add('grid-game-container', 'pointer-none');
        this.parentElement.appendChild(this.gridPlace);
        if (this.saveDesctopProportions) {
            this.parentElement.classList.add('save-proportions')
        }
        this.createModalPrompt();
        this.createModalResult()
    }

    createModalPrompt() {
        this.modalPrompt.classList.add('modal-prompt');
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-prompt__content');
        const modalClose = document.createElement('div');
        modalClose.classList.add('modal-prompt__close');
        const modalText = document.createElement('div');
        modalText.classList.add('modal-prompt__text');
        modalContent.append(modalClose);
        modalContent.append(modalText);
        this.modalPrompt.append(modalContent);
        this.parentElement.append(this.modalPrompt);
    }

    createModalResult() {
        this.modalResult.classList.add('modal-result');
        const modalContent = `
        <div class="modal-result__content">
            <div class="modal-result__close"></div>
            <div class="modal-result__ico"></div>
            <div class="modal-result__title">Ура вы победили,<br> вы молодец!<br> Собрали пятнашки!</div>
            <div class="modal-result__text">${this.resultMessage || ' '}</div>
            <div class="modal-result__btn">Собрать ещё раз</div>
        </div>`;
        this.modalResult.insertAdjacentHTML('afterbegin', modalContent);
        this.parentElement.append(this.modalResult);
    }

    cardsGenerate() {
        return new Promise((res, rej) => {
            this.gridPlace.innerHTML = '';
            this.gridPlace.setAttribute('data-cards-cound', this.cardsCount);
            this.gridPlace.classList.remove('segments', 'normal', 'loaded');
            this.cardsCount % 2 !== 0 ? this.gridPlace.classList.add('segments') : this.gridPlace.classList.add('normal');
            for (let index = 0; index < this.cardsCount; index++) {
                const card = document.createElement("div");
                const cardInner = document.createElement("div");
                const cardText = this.cardsText[index];
                if (cardText && cardText.trim().length > 0) {
                    const cardNameplate = document.createElement("div");
                    cardNameplate.setAttribute('data-prompt', cardText);
                    cardNameplate.classList.add("game-grid-item__prompt");
                    cardInner.append(cardNameplate);
                }
                cardInner.classList.add("game-grid-item__inner");
                cardInner.style.backgroundImage = `url(${this.cardImages[index]})`;
                card.append(cardInner);
                card.classList.add("game-grid-item", this.arrowType);
                card.setAttribute("data-card-num", index + 1);
                if (index === this.cardsCount - 1) card.setAttribute("data-last-card", '');
                this.cardsArr.push(card);
            }
            this.gridPlace.append(...this.cardsArr);
            res();
        })
    }

    getElementsPosition() {
        let columnCount
        if (this.saveDesctopProportions) {
            columnCount = 3;
        } else {
            columnCount = window.innerWidth > 576 ? 3 : 2;
        }
        const parentHeight = Math.ceil(this.cardsArr.length / columnCount) * this.cardsArr[0].offsetHeight;
        this.gridPlace.style.height = `${parentHeight + 30}px`;

        if (columnCount === 2 && this.cardsArr.length % 2 !== 0) {
            const lastCard = this.cardsArr.find(item => item.hasAttribute('data-last-card'));
            const lastCardIndex = this.cardsArr.findIndex(item => item.hasAttribute('data-last-card'));
            if (lastCard) {
                this.cardsArr.splice(lastCardIndex, 1);
                this.cardsArr.push(lastCard);
            }
        }

        this.cardsArr.forEach((item, index) => {
            const itemWidth = (this.gridPlace.clientWidth / columnCount) - (30 / columnCount);
            const itemHeight = item.offsetHeight;
            const column = index % columnCount; // определяем номер колонки (от 1 до 3)
            const row = Math.floor(index / columnCount);// определяем номер строки
            item.style.width = `${itemWidth}px`;
            item.style.left = `${(itemWidth * column) + 15}px`;
            item.style.top = `${(itemHeight * row) + 15}px`;
        });

    }

    cardsRandomPosition() {
        this.cardsArr = this.shuffleArray(this.cardsArr);
    }

    clickLoader(e) {
        const selectedCardPos = {
            y: '',
            x: ''
        };

        const target = e.target;
        if (target.closest('.modal-result__btn')) {
            this.cardsRandomPosition();
            this.getElementsPosition();
            this.modalResult.classList.remove('show');
        }

        if (target.closest('.modal-result__close') || (target.closest('.modal-result') && !target.closest('.modal-result__content'))) {
            this.modalResult.classList.remove('show');
            return;
        }

        if (target.closest('.modal-prompt__close') || (target.closest('.modal-prompt') && !target.closest('.modal-prompt__content'))) {
            this.modalPrompt.classList.remove('show');
            return;
        }

        if (target.closest('.game-grid-item__prompt')) {
            const currentTargetPrompt = target.closest('.game-grid-item__prompt').dataset.prompt;
            const modalContentArea = this.modalPrompt.querySelector('.modal-prompt__text');
            modalContentArea.innerHTML = currentTargetPrompt;
            this.modalPrompt.classList.add('show');
            return;
        }


        if (target.closest('[data-last-card]') && window.innerWidth < 567 && this.cardsArr.length % 2 !== 0 && !this.saveDesctopProportions) {
            return
        }

        if (target.closest('.game-grid-item')) {

            if (target.closest('.game-grid-item.big')) {
                target.closest('.game-grid-item.big').classList.remove('big');
                return;
            }

            const clickedCard = target.closest('.game-grid-item');
            const selectedCard = this.gridPlace.querySelector('.game-grid-item.big');
            selectedCardPos.y = clickedCard.style.top;
            selectedCardPos.x = clickedCard.style.left;

            if (selectedCard) {
                clickedCard.style.top = selectedCard.style.top;
                clickedCard.style.left = selectedCard.style.left;
                selectedCard.style.top = selectedCardPos.y;
                selectedCard.style.left = selectedCardPos.x;

                this.gridPlace.querySelectorAll('.game-grid-item.big').forEach(item => item.classList.remove('big'));

                const openedEl = this.cardsArr.find(item => item === selectedCard);
                const openedElIndex = this.cardsArr.findIndex(item => item === selectedCard);

                const currenEl = this.cardsArr.find(item => item === clickedCard);
                const currenElIndex = this.cardsArr.findIndex(item => item === clickedCard);

                this.cardsArr.splice(openedElIndex, 1, currenEl);
                this.cardsArr.splice(currenElIndex, 1, openedEl);

                // Повторная отрисовка всех карточек для изменения их струтуры в html
                setTimeout(() => {
                    this.gridPlace.innerHTML = '';
                    this.cardsArr.forEach(item => this.gridPlace.appendChild(item));
                    const dataArr = this.cardsArr.reduce((acc, i) => {
                        acc.push(i.dataset.cardNum)
                        return acc;
                    }, []);

                    const cardsOrder = dataArr.join('');
                    if (cardsOrder == this.correctOrder) {
                        setTimeout(() => {
                            this.modalResult.classList.add('show');
                        }, 200);
                    }
                }, 350);

            } else {
                clickedCard.classList.toggle('big');
            }
        }
    }

    addEventListeners() {
        window.addEventListener('resize', this.windowListener, false);
        window.addEventListener('pointerup', this.clickListener, false);
    }

    init() {
        setTimeout(() => { this.gridPlace.classList.add('loaded'); }, 200);
        this.createCardsParent();
        this.cardsGenerate()
            .then(() => {
                this.getElementsPosition();
                setTimeout(() => {
                    // this.cardsRandomPosition();
                    this.getElementsPosition();
                    setTimeout(() => {
                        this.gridPlace.classList.remove('pointer-none');
                        // this.cardsRandomPosition();
                        this.getElementsPosition();
                    }, 600);
                }, 1200);
            })
    }

    destroy() {
        this.parentElement.innerHTML = '';
        this.cardsArr = [];
        window.removeEventListener('resize', this.windowListener, false);
        window.removeEventListener('pointerdown', this.clickListener, false);
    }
}
