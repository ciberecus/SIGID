
import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Users } from "lucide-react";
import { UserCard } from './UserCard';

interface UserSectionProps {
  title: string;
  users: any[];
  getAssignmentInfo: (user: any) => string;
  handleToggleActive: (userId: string, currentState: boolean) => void;
  handleStartEdit: (user: any) => void;
  startPasswordReset: (user: any) => void;
  handleDeleteUser: (id: string) => void;
}

export const UserSection: React.FC<UserSectionProps> = ({
  title,
  users,
  getAssignmentInfo,
  handleToggleActive,
  handleStartEdit,
  startPasswordReset,
  handleDeleteUser
}) => {
  const printSection = (title: string, content: HTMLElement | null) => {
    const printWindow = window.open('', '_blank');
    if (printWindow && content) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir ${title}</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .user-card { 
                border: 1px solid #ccc; 
                margin: 10px 0; 
                padding: 15px;
                border-radius: 8px;
              }
              .user-info { margin: 5px 0; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            ${content.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const sectionId = `${title.toLowerCase()}-section`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users />
          {title} ({users.length})
        </h2>
        <Button
          onClick={() => {
            const content = document.getElementById(sectionId);
            printSection(`Listado de ${title}`, content);
          }}
          variant="outline"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="mr-2" />
          Imprimir {title}
        </Button>
      </div>
      <div id={sectionId} className="space-y-2">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            assignmentInfo={getAssignmentInfo(user)}
            handleToggleActive={handleToggleActive}
            handleStartEdit={handleStartEdit}
            startPasswordReset={startPasswordReset}
            handleDeleteUser={handleDeleteUser}
          />
        ))}
      </div>
    </div>
  );
};
