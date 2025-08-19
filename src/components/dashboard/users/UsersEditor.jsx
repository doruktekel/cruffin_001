"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Save,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  Trash2,
  AlertTriangle,
  Undo,
} from "lucide-react";
import { useSubmitUsers } from "@/hooks/useSubmitUsers";
import { toast } from "react-toastify";
import { useStore } from "@/app/zustand/store";

const UsersEditor = ({ users }) => {
  const [usersData, setUsersData] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState(new Set()); // Silinmek üzere işaretlenen kullanıcılar
  const [hasChanges, setHasChanges] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const { submitUsers, loading: submitLoading, error } = useSubmitUsers();

  // Zustand store'dan currentUser'ı al
  const { user: currentUser, isAuth } = useStore();

  useEffect(() => {
    if (users && Array.isArray(users) && users.length > 0) {
      setUsersData(users);
    } else {
      setUsersData([]);
    }
  }, [users]);

  // Client-side validation - Check user permissions
  const hasAdminPermissions = () => {
    if (!isAuth || !currentUser) {
      toast.error("Oturum açmanız gerekiyor.");
      return false;
    }

    if (currentUser.role === "user") {
      toast.error("Bu işlem için admin yetkisi gereklidir.");
      return false;
    }

    return true;
  };

  const canDeleteUser = (userToDelete) => {
    if (!hasAdminPermissions()) return false;

    // Kendi hesabını silmeye çalışıyor mu?
    if (currentUser._id === userToDelete._id) {
      toast.error("Kendi hesabınızı silemezsiniz.");
      return false;
    }

    // Superadmin'i silmeye çalışıyor mu ve kendisi superadmin değil mi?
    if (
      userToDelete.role === "superadmin" &&
      currentUser.role !== "superadmin"
    ) {
      toast.error(
        "Superadmin kullanıcıları sadece superadmin tarafından silinebilir."
      );
      return false;
    }

    return true;
  };

  const handleApprovalChange = (userId, isApproved) => {
    if (!hasAdminPermissions()) return;

    setUsersData((prev) =>
      prev.map((user) => (user._id === userId ? { ...user, isApproved } : user))
    );
    setHasChanges(true);
  };

  const handleDeleteClick = (user) => {
    if (!canDeleteUser(user)) return;
    setUserToDelete(user);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;

    // Kullanıcıyı silinecekler listesine ekle
    setDeletedUsers((prev) => new Set([...prev, userToDelete._id]));
    setUserToDelete(null);
    setHasChanges(true);

    toast.info(`${userToDelete.email} kullanıcısı silinmek üzere işaretlendi.`);
  };

  const handleUndoDelete = (userId) => {
    // Silme işlemini geri al
    setDeletedUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });

    // Eğer başka değişiklik yoksa hasChanges'i false yap
    const hasOtherChanges = usersData.some((user) => {
      const originalUser = users.find((u) => u._id === user._id);
      return originalUser && originalUser.isApproved !== user.isApproved;
    });

    if (!hasOtherChanges && deletedUsers.size === 1) {
      setHasChanges(false);
    }

    toast.info("Silme işlemi geri alındı.");
  };

  const handleSubmit = async () => {
    // 2 saniye içinde tekrar submit'i engelle
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      return;
    }
    setLastSubmitTime(now);

    if (!hasAdminPermissions()) return;

    if (!hasChanges) {
      toast.info("Herhangi bir değişiklik yapılmadı.");
      return;
    }

    // Silinmeyecek kullanıcıları filtrele ve sadece gerekli alanları gönder
    const usersToUpdate = usersData
      .filter((user) => !deletedUsers.has(user._id))
      .map(({ _id, email, isApproved }) => ({
        _id,
        email,
        isApproved,
      }));

    // Silinecek kullanıcı ID'lerini array'e çevir
    const usersToDelete = Array.from(deletedUsers);

    const dataToSubmit = {
      usersToUpdate,
      usersToDelete,
    };

    try {
      await submitUsers(dataToSubmit);

      // Başarılı güncelleme sonrası local state'i güncelle
      setUsersData((prev) =>
        prev.filter((user) => !deletedUsers.has(user._id))
      );
      setDeletedUsers(new Set());
      setHasChanges(false);
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("Kaydetme sırasında bir hata oluştu.");
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Bilinmeyen";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Silinmeyecek kullanıcıları filtrele
  const activeUsers = usersData.filter((user) => !deletedUsers.has(user._id));
  const approvedCount = activeUsers.filter((user) => user.isApproved).length;
  const pendingCount = activeUsers.filter((user) => !user.isApproved).length;

  // Permission check for rendering
  if (
    !isAuth ||
    !currentUser ||
    (currentUser.role !== "admin" && currentUser.role !== "superadmin")
  ) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-16 h-16 mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Yetkisiz Erişim
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {!isAuth || !currentUser
            ? "Bu sayfaya erişmek için oturum açmanız gerekiyor."
            : "Bu sayfaya erişmek için admin yetkilerine sahip olmanız gerekiyor."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Kullanıcı Yönetimi</h2>
        <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Onaylı: {approvedCount}
          </span>
          <span className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Bekliyor: {pendingCount}
          </span>
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Aktif: {activeUsers.length}
          </span>
          {deletedUsers.size > 0 && (
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              Silinecek: {deletedUsers.size}
            </span>
          )}
        </div>
      </div>

      {/* Users List */}
      {usersData.length === 0 ? (
        <div className="text-center py-8">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Henüz kayıtlı kullanıcı bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {usersData.map((user) => {
            const isMarkedForDeletion = deletedUsers.has(user._id);

            return (
              <Card
                key={user._id}
                className={`transition-all duration-200 relative ${
                  isMarkedForDeletion
                    ? "border-red-500 bg-red-100 dark:bg-red-950/50 dark:border-red-600 opacity-60"
                    : user.isApproved
                    ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800"
                    : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                }`}
              >
                {isMarkedForDeletion && (
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
                    Silinecek
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      {/* <span className="font-medium text-sm">
                        #{user._id.slice(-6)}
                      </span> */}
                    </div>
                    <div className="flex items-center gap-2">
                      {isMarkedForDeletion ? (
                        /* Geri Al Butonu */
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUndoDelete(user._id)}
                          className="h-8 w-8 text-blue-500 bg-blue-100 dark:hover:bg-blue-800 cursor-pointer"
                          title="Silme İşlemini Geri Al"
                        >
                          <Undo size={18} />
                        </Button>
                      ) : (
                        /* Sil Butonu */
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(user)}
                              className="h-8 w-8 text-red-500  bg-red-100 dark:hover:bg-red-800 cursor-pointer"
                              title="Kullanıcıyı Sil"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Kullanıcıyı Sil
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                <strong>"{userToDelete?.email}"</strong>{" "}
                                kullanıcısını silmek üzere işaretlemek
                                istediğinizden emin misiniz?
                                <br />
                                <span className="font-medium mt-2 block">
                                  Kullanıcı{" "}
                                  <span className="text-red-500">
                                    "Değişiklikleri Kaydet"
                                  </span>{" "}
                                  butonuna basıldığında kalıcı olarak
                                  silinecektir.
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setUserToDelete(null)}
                                className="cursor-pointer"
                              >
                                İptal
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                className=" focus:ring-red-600 cursor-pointer"
                              >
                                Evet, İşaretle
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm truncate" title={user.email}>
                      {user.email}
                    </span>
                  </div>

                  {/* Kayıt Tarihi */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>

                  {/* Onay Switch - Silinmek üzere işaretlenmişse devre dışı */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`approval-${user._id}`}
                        className={`text-sm font-medium cursor-pointer ${
                          isMarkedForDeletion ? "text-gray-400" : ""
                        }`}
                      >
                        {user.isApproved ? "Onaylı" : "Bekliyor"}
                      </Label>
                      <Switch
                        id={`approval-${user._id}`}
                        checked={user.isApproved}
                        onCheckedChange={(checked) =>
                          handleApprovalChange(user._id, checked)
                        }
                        disabled={isMarkedForDeletion}
                        className="scale-110 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center p-1">
                      {user.isApproved ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Save Button */}
      {usersData.length > 0 && (
        <div className="text-center pt-4">
          <Button
            onClick={handleSubmit}
            className={`px-6 py-2 cursor-pointer`}
            disabled={submitLoading}
          >
            <Save size={20} className="mr-2" />
            {submitLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>

          {hasChanges && (
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              {deletedUsers.size > 0 && (
                <p className="text-red-600">
                  • {deletedUsers.size} kullanıcı silinecek
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersEditor;
