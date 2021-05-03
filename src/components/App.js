import React from "react";
import "../index.css";
import Header from "./Header.js";
import Main from "./Main.js";
import Footer from "./Footer.js";
import ImagePopup from "./ImagePopup.js";
import { api } from "../utils/api.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ConfirmPopup from "./ConfirmPopup";

function App() {
  const [isEditProfilePopupOpen, setEditProfileClick] = React.useState(false);
  const [isAddPlacePopupOpen, setAddPlaceClick] = React.useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarClick] = React.useState(false);
  const [isConfirmPopupOpen, setConfirmClick] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({});
  const [currentUser, setCurrentUser] = React.useState([]);
  const [cards, setInitialCards] = React.useState([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletedCard, setDeletedCard] = React.useState({});

  React.useEffect(() => {
    Promise.all([api.getUserProfile(), api.getInitialCards()])
      .then(([data, cards]) => {
        setCurrentUser(data);
        setInitialCards(cards);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api.changeLikeCardStatus(card._id, !isLiked).then((newCard) => {
      setInitialCards((state) =>
        state.map((c) => (c._id === card._id ? newCard : c))
      );
    });
  }

  function handleEditAvatarClick() {
    setEditAvatarClick(true);
  }

  function handleEditProfileClick() {
    setEditProfileClick(true);
  }

  function handleAddPlaceClick() {
    setAddPlaceClick(true);
  }

  function closeAllPopups() {
    setEditProfileClick(false);
    setAddPlaceClick(false);
    setEditAvatarClick(false);
    setConfirmClick(false);
    setSelectedCard({});
    setDeletedCard({});
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleDeleteClick(card) {
    setConfirmClick(true);
    setDeletedCard(card);
  }

  function handleCardDelete() {
    setIsSaving(true);

    api
      .deleteCard(deletedCard._id)

      .then(() => {
        setInitialCards((cards) =>
          cards.filter((c) => c._id !== deletedCard._id)
        );
      })
      .then(() => closeAllPopups())
      .catch((err) => console.log(err))
      .finally(() => setIsSaving(false));
  }

  function handleUpdateUser(data) {
    setIsSaving(true);
    api
      .setUserProfile(data)
      .then((data) => setCurrentUser(data))
      .then(() => closeAllPopups())
      .catch((err) => console.log(err))
      .finally(() => setIsSaving(false));
  }

  function handleUpdateAvatar(avatar) {
    setIsSaving(true);
    api
      .setUserAvatar(avatar)
      .then((avatar) => setCurrentUser(avatar))
      .then(() => closeAllPopups())
      .catch((err) => console.log(err))
      .finally(() => setIsSaving(false));
  }

  function handleAddPlaceSubmit(card) {
    setIsSaving(true);
    api
      .postNewCard(card)
      .then((card) => setInitialCards([card, ...cards]))
      .then(() => closeAllPopups())
      .catch((err) => console.log(err))
      .finally(() => setIsSaving(false));
  }

  return (
    <div className='page'>
      <div className='page__container'>
        <CurrentUserContext.Provider value={currentUser}>
          <Header />
          <Main
            onEditAvatar={handleEditAvatarClick}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            cards={cards}
            onCardLike={handleCardLike}
            onCardDelete={handleDeleteClick}
            onCardClick={handleCardClick}
          />
          <Footer />

          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
            isSaving={isSaving}
          />

          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
            isSaving={isSaving}
          />

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
            isSaving={isSaving}
          />

          <ImagePopup card={selectedCard} onClose={closeAllPopups} />

          <ConfirmPopup
            isOpen={isConfirmPopupOpen}
            onClose={closeAllPopups}
            onConfirm={handleCardDelete}
            isSaving={isSaving}
          />
        </CurrentUserContext.Provider>
      </div>
    </div>
  );
}

export default App;
