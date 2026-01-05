#include <iostream>
using namespace std;

class BankAccount {
private:
    string name;
    double balance;

public:
    BankAccount(string n, double b) {
        name = n;
        balance = b;
    }

    void deposit(double amount) {
        balance += amount;
    }

    void withdraw(double amount) {
        if (amount <= balance)
            balance -= amount;
        else
            cout << "Insufficient balance\n";
    }

    void display() {
        cout << "Account Holder: " << name << endl;
        cout << "Balance: ₹" << balance << endl;
    }
};

int main() {
    BankAccount acc("Shannon", 5000);

    acc.deposit(2000);
    acc.withdraw(1500);
    acc.display();

    return 0;
}
