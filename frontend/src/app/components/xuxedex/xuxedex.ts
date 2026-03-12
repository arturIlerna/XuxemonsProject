import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { XuxedexService, Xuxemon, User } from '../../services/xuxedex.service';


@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './xuxedex.html',
  styleUrl: './xuxedex.css'
})
export class Xuxedex implements OnInit {

 userName: string = '';
  userId: number = 0;
  isAdmin: boolean = false;
  
  allXuxemons: Xuxemon[] = [];
  filteredXuxemons: Xuxemon[] = [];
  users: User[] = [];
  selectedUserId: number = 0;

  searchTerm: string = '';
  selectedType: string = 'todos';
  selectedSize: string = 'todas';
  

  loading: boolean = false;
  error: string = '';



  }

