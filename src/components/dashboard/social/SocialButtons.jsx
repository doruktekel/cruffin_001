"use client";

import { Button } from "@/components/ui/button";
import useSubmitLinks from "@/hooks/useSubmitLinks";
import { Plus, Save, AlertTriangle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import DraggableButtonRow from "./DraggableButtonRow";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FaFacebook,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedin,
  FaPinterest,
  FaReddit,
  FaTumblr,
  FaVimeo,
  FaSpotify,
} from "react-icons/fa6";

const SocialButtons = ({ newSocials }) => {
  const [links, setLinks] = useState(newSocials || []);
  const [activeButtons, setActiveButtons] = useState([]);
  const [deletedButtons, setDeletedButtons] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
    pinterest: "",
    reddit: "",
    tumblr: "",
    vimeo: "",
    spotify: "",
  });

  // İlk yükleme durumunu takip etmek için
  const [initialState, setInitialState] = useState({
    activeButtons: [],
    socialLinks: {},
    isLoaded: false,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    buttonKey: null,
    buttonName: "",
  });
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const newInputRef = useRef(null);

  const {
    submitLinks,
    loading: submitLoading,
    error: submitError,
  } = useSubmitLinks();

  const allButtons = [
    {
      icon: <FaFacebook size={30} />,
      label: "Facebook",
      key: "facebook",
    },
    {
      icon: <FaXTwitter size={30} />,
      label: "Twitter",
      key: "twitter",
    },
    {
      icon: <FaInstagram size={30} />,
      label: "Instagram",
      key: "instagram",
    },
    {
      icon: <FaYoutube size={30} />,
      label: "Youtube",
      key: "youtube",
    },
    {
      icon: <FaTiktok size={30} />,
      label: "Tiktok",
      key: "tiktok",
    },
    {
      icon: <FaLinkedin size={30} />,
      label: "Linkedin",
      key: "linkedin",
    },
    {
      icon: <FaPinterest size={30} />,
      label: "Pinterest",
      key: "pinterest",
    },
    {
      icon: <FaReddit size={30} />,
      label: "Reddit",
      key: "reddit",
    },
    {
      icon: <FaTumblr size={30} />,
      label: "Tumblr",
      key: "tumblr",
    },
    {
      icon: <FaVimeo size={30} />,
      label: "Vimeo",
      key: "vimeo",
    },
    {
      icon: <FaSpotify size={30} />,
      label: "Spotify",
      key: "spotify",
    },
  ];

  // Drag & Drop için sensorları ayarlıyoruz
  const sensors = useSensors(useSensor(PointerSensor));

  // Değişiklik kontrolü fonksiyonu
  const hasChanges = () => {
    if (!initialState.isLoaded) return false;

    // Aktif butonlar karşılaştırması
    if (activeButtons.length !== initialState.activeButtons.length) return true;

    const sortedCurrent = [...activeButtons].sort();
    const sortedInitial = [...initialState.activeButtons].sort();

    if (JSON.stringify(sortedCurrent) !== JSON.stringify(sortedInitial))
      return true;

    // Sosyal linkler karşılaştırması (sadece aktif butonlar için)
    for (const key of activeButtons) {
      if (socialLinks[key] !== initialState.socialLinks[key]) return true;
    }

    // Sıralama değişikliği kontrolü
    for (let i = 0; i < activeButtons.length; i++) {
      if (activeButtons[i] !== initialState.activeButtons[i]) return true;
    }

    // Silme işlemi kontrolü
    if (deletedButtons.length > 0) return true;

    return false;
  };

  // Drag işlemi bittiğinde sırayı güncelleme
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeButtons.indexOf(active.id);
    const newIndex = activeButtons.indexOf(over.id);

    const newOrder = arrayMove(activeButtons, oldIndex, newIndex);
    setActiveButtons(newOrder);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // 2 saniye içinde tekrar submit'i engelle
  //   const now = Date.now();
  //   if (now - lastSubmitTime < 2000) {
  //     return;
  //   }
  //   setLastSubmitTime(now);

  //   // Değişiklik kontrolü
  //   if (!hasChanges()) {
  //     toast.info("Herhangi bir değişiklik yapılmamıştır.");
  //     return;
  //   }

  //   const emptyPlatform = activeButtons.find(
  //     (key) => !socialLinks[key] || socialLinks[key].trim() === ""
  //   );

  //   if (emptyPlatform) {
  //     const buttonLabel =
  //       allButtons.find((btn) => btn.key === emptyPlatform)?.label ||
  //       emptyPlatform;
  //     toast.error(`Lütfen ${buttonLabel} için bir link giriniz.`);
  //     return;
  //   }

  //   const linksToSend = activeButtons.map((key, index) => ({
  //     platform: key,
  //     url: socialLinks[key],
  //     order: index,
  //   }));

  //   try {
  //     const result = await submitLinks(linksToSend);

  //     if (result) {
  //       // Başarılı kayıt sonrası tüm state'leri temizle/güncelle

  //       // 1. Links state'ini güncel aktif butonlara göre güncelle
  //       const updatedLinks = linksToSend.map((link, index) => ({
  //         ...link,
  //         _id:
  //           result.newSocialMedia[index]?._id ||
  //           Math.random().toString(36).substr(2, 9),
  //         order: index,
  //       }));
  //       setLinks(updatedLinks);

  //       // 2. SocialLinks state'ini temizle (silinen platformlar için)
  //       const cleanedSocialLinks = {};
  //       activeButtons.forEach((key) => {
  //         cleanedSocialLinks[key] = socialLinks[key];
  //       });

  //       // Silinen platformların linklerini temizle
  //       allButtons.forEach((button) => {
  //         if (!activeButtons.includes(button.key)) {
  //           cleanedSocialLinks[button.key] = "";
  //         }
  //       });

  //       setSocialLinks(cleanedSocialLinks);

  //       // 3. Silinen butonları tamamen temizle - EN SONDA YAPILMALI
  //       setDeletedButtons([]);

  //       // 4. İlk durumu güncelle - ÇOK ÖNEMLİ!
  //       setInitialState({
  //         activeButtons: [...activeButtons],
  //         socialLinks: { ...cleanedSocialLinks },
  //         isLoaded: true,
  //       });

  //       toast.success("Değişiklikler başarıyla kaydedildi!");
  //     }
  //   } catch (error) {
  //     console.error("Kaydetme hatası:", error);
  //     toast.error("Kaydetme sırasında bir hata oluştu.");
  //   }
  // };

  const handleActiveButtonClick = (buttonKey) => () => {
    if (activeButtons.includes(buttonKey)) {
      setActiveButtons(activeButtons.filter((key) => key !== buttonKey));
      setSocialLinks((prev) => ({
        ...prev,
        [buttonKey]: "",
      }));
    } else {
      setActiveButtons([...activeButtons, buttonKey]);
    }

    setTimeout(() => {
      newInputRef.current?.focus();
    }, 0);
  };

  // Silme dialogunu açma
  const handleDeleteButton = (buttonKey, buttonName) => {
    setDeleteDialog({
      isOpen: true,
      buttonKey: buttonKey,
      buttonName: buttonName || "Bu sosyal medya hesabı",
    });
  };

  // Silme işlemini onaylama
  const confirmDelete = () => {
    const { buttonKey } = deleteDialog;

    // Aktif butonlardan çıkar ve silinecekler listesine ekle
    setActiveButtons((prev) => prev.filter((key) => key !== buttonKey));

    // Silinen butonlar listesine ekle
    const buttonData = allButtons.find((btn) => btn.key === buttonKey);
    setDeletedButtons((prev) => [
      ...prev,
      {
        key: buttonKey,
        label: buttonData.label,
        icon: buttonData.icon,
        url: socialLinks[buttonKey],
      },
    ]);

    // Dialog'u kapat
    setDeleteDialog({
      isOpen: false,
      buttonKey: null,
      buttonName: "",
    });

    toast.info(
      "Sosyal medya hesabı silme işlemi için sıraya alındı. Değişiklikleri kaydedin.",
      {
        position: "top-right",
      }
    );
  };

  // Silme işlemini iptal etme
  const cancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      buttonKey: null,
      buttonName: "",
    });
  };

  // Silinen butonları geri getirme (undo)
  const handleUndoDelete = (buttonKey) => {
    const deletedButton = deletedButtons.find((btn) => btn.key === buttonKey);

    if (deletedButton) {
      // Orijinal order değerini bul (eğer varsa)
      const originalOrder = links.find(
        (link) => link.platform === buttonKey
      )?.order;

      // Eğer orijinal order varsa, doğru pozisyona ekle
      if (originalOrder !== undefined) {
        setActiveButtons((prev) => {
          const newActiveButtons = [...prev, buttonKey];

          // Order değerine göre sırala
          return newActiveButtons.sort((a, b) => {
            const orderA =
              links.find((link) => link.platform === a)?.order ?? 999;
            const orderB =
              links.find((link) => link.platform === b)?.order ?? 999;
            return orderA - orderB;
          });
        });
      } else {
        // Orijinal order yoksa en sona ekle
        setActiveButtons((prev) => [...prev, buttonKey]);
      }

      // Silinen butonlardan çıkar
      setDeletedButtons((prev) => prev.filter((btn) => btn.key !== buttonKey));

      // Link'i geri getir
      setSocialLinks((prev) => ({
        ...prev,
        [buttonKey]: deletedButton.url,
      }));

      toast.success("Sosyal medya hesabı geri getirildi.", {
        position: "top-right",
      });
    }
  };

  const clickableButtons = allButtons.filter(
    (button) =>
      !activeButtons.includes(button.key) &&
      !deletedButtons.some((deleted) => deleted.key === button.key)
  );

  // handleSubmit fonksiyonunda değişiklik
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2 saniye içinde tekrar submit'i engelle
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      return;
    }
    setLastSubmitTime(now);

    // Değişiklik kontrolü
    if (!hasChanges()) {
      toast.info("Herhangi bir değişiklik yapılmamıştır.");
      return;
    }

    const emptyPlatform = activeButtons.find(
      (key) => !socialLinks[key] || socialLinks[key].trim() === ""
    );

    if (emptyPlatform) {
      const buttonLabel =
        allButtons.find((btn) => btn.key === emptyPlatform)?.label ||
        emptyPlatform;
      toast.error(`Lütfen ${buttonLabel} için bir link giriniz.`);
      return;
    }

    const linksToSend = activeButtons.map((key, index) => ({
      platform: key,
      url: socialLinks[key],
      order: index,
    }));

    try {
      const result = await submitLinks(linksToSend);

      if (result) {
        // Başarılı kayıt sonrası tüm state'leri güncelle

        // 1. Links state'ini güncel aktif butonlara göre güncelle
        const updatedLinks = linksToSend.map((link, index) => ({
          ...link,
          _id:
            result.newSocialMedia[index]?._id ||
            Math.random().toString(36).substr(2, 9),
          order: index,
        }));
        setLinks(updatedLinks);

        // 2. SocialLinks state'ini temizle (silinen platformlar için)
        const cleanedSocialLinks = {};
        activeButtons.forEach((key) => {
          cleanedSocialLinks[key] = socialLinks[key];
        });

        // Silinen platformların linklerini temizle
        allButtons.forEach((button) => {
          if (!activeButtons.includes(button.key)) {
            cleanedSocialLinks[button.key] = "";
          }
        });

        setSocialLinks(cleanedSocialLinks);

        // 3. İlk durumu güncelle
        setInitialState({
          activeButtons: [...activeButtons],
          socialLinks: { ...cleanedSocialLinks },
          isLoaded: true,
        });

        // 4. Silinen butonları hemen temizle
        setDeletedButtons([]);

        // toast.success("Değişiklikler başarıyla kaydedildi!");
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("Kaydetme sırasında bir hata oluştu.");
    }
  };

  // Ek olarak, başarılı kayıt sonrası deletedButtons'u temizlemek için useEffect ekleyin
  useEffect(() => {
    // Eğer başarılı bir kayıt yapıldıysa ve hala silinen butonlar varsa, bunları temizle
    if (initialState.isLoaded && deletedButtons.length > 0 && !hasChanges()) {
      const timer = setTimeout(() => {
        setDeletedButtons([]);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [links, initialState.isLoaded]);

  // İlk yükleme effect'i
  useEffect(() => {
    if (links && links.length > 0) {
      const activeKeys = [];
      const linkData = {};

      links.forEach((link) => {
        activeKeys.push(link.platform);
        linkData[link.platform] = link.url;
      });

      setActiveButtons(activeKeys);
      setSocialLinks(linkData);

      // İlk durumu kaydet
      setInitialState({
        activeButtons: [...activeKeys],
        socialLinks: { ...linkData },
        isLoaded: true,
      });
    } else {
      // Boş durumda da initial state'i ayarla
      setInitialState({
        activeButtons: [],
        socialLinks: {},
        isLoaded: true,
      });
    }
  }, [links]);

  return (
    <>
      <div className="flex flex-col gap-4 overflow-hidden mb-4">
        <div className="flex justify-center items-center ">
          <p className="text-lg font-semibold">Sosyal Medya Yönetimi</p>
        </div>
        <form onSubmit={handleSubmit} className="overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeButtons}
              strategy={verticalListSortingStrategy}
            >
              {activeButtons.map((key, index) => {
                const btn = allButtons.find((b) => b.key === key);
                const isLast = index === activeButtons.length - 1;
                return (
                  <DraggableButtonRow
                    key={key}
                    keyName={key}
                    icon={btn.icon}
                    label={btn.label}
                    link={socialLinks[key]}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    onDelete={() => handleDeleteButton(key, btn.label)}
                    inputRef={isLast ? newInputRef : null}
                  />
                );
              })}
            </SortableContext>
          </DndContext>

          {/* Silinen sosyal medya hesaplarının listesi */}
          {deletedButtons.length > 0 && (
            <div className="mt-6 space-y-3 bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 opacity-60">
              {deletedButtons.map((button) => (
                <div
                  key={button.key}
                  className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md p-2 mb-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <AlertTriangle size={16} />
                      <span className="text-sm font-medium">
                        "{button.label}" sosyal medya hesabı silinmek üzere
                        işaretlendi
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleUndoDelete(button.key)}
                      className="text-red-700 dark:text-red-500 border-red-300  hover:bg-red-200  border cursor-pointer dark:bg-white dark:hover:bg-red-100"
                    >
                      Geri Yükle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4">
            {clickableButtons.map((item) => (
              <button
                type="button"
                key={item.key}
                className="flex items-center gap-2 p-2 hover:bg-neutral-500 hover:text-white hover:cursor-pointer border border-neutral-500"
                onClick={handleActiveButtonClick(item.key)}
              >
                <Plus size={20} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="cursor-pointer  "
              disabled={submitLoading}
            >
              <Save size={20} />
              {submitLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </form>
      </div>

      {/* Silme Onay Dialogu */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Sosyal Medya Hesabını Silmek İstediğinize Emin misiniz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <div>
                  "
                  <strong className="text-red-500">
                    {deleteDialog.buttonName}
                  </strong>
                  " sosyal medya hesabını silmek üzeresiniz.
                </div>
                <p>
                  Bu sosyal medya hesabı silinmek üzere işaretlenecek ve
                  "Değişiklikleri Kaydet" butonuna bastığınızda kalıcı olarak
                  silinecektir.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDelete}
              className="cursor-pointer"
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="cursor-pointer"
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SocialButtons;
