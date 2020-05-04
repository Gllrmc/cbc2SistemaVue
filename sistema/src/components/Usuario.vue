<template>
    <v-row align="start">
        <v-col>
            <v-data-table
            :headers="headers"
            :items="usuarios"
            :search="search"
            class="elevation-1"
            no-data-text="Nada para mostrar"
            >
            <template v-slot:top>
                <v-toolbar flat color="white">
                    <div class="ma-2">
                        <v-btn small @click="crearPDF()"><v-icon>print</v-icon></v-btn>
                    </div>
                    <v-toolbar-title>Usuarios</v-toolbar-title>
                    <v-snackbar
                        v-model="snackbar"
                        :timeout="timeout"
                        right
                        color="error"
                        >
                        {{ snacktext }}
                        <v-btn 
                            color="error"
                            dark
                            vertical
                            text
                            @click="snackbar = false"
                        >
                            Cerrar
                        </v-btn>
                    </v-snackbar>                   
                    <v-divider
                        class="mx-4"
                        inset
                        vertical
                    ></v-divider>
                    <v-spacer></v-spacer>
                    <v-text-field label="Búsqueda" outlined v-model="search" append-icon="search" single-line hide-details></v-text-field>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="600px">
                        <template v-slot:activator="{ on }">
                        <v-btn color="primary" dark class="mb-2" v-on="on">Nuevo</v-btn>
                        </template>
                        <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-container grid-list-md>
                                <v-row dense>

                                    <v-flex cols="12" sm="6" md="6">
                                        <v-text-field v-model="userid" label="Userid">
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex cols="12" sm="6" md="6">
                                        <v-select v-model="rolId"
                                        :items="roles" label="Rol">
                                        </v-select>
                                    </v-flex>
                                    <v-flex cols="12" sm="6" md="6">
                                        <v-autocomplete 
                                        v-model="personaId" 
                                        clearable
                                        :items="personas"
                                        :search-input.sync="searchpe"
                                        label="Persona">
                                        </v-autocomplete>
                                    </v-flex>
                                    <v-flex cols="12" sm="6" md="6">
                                        <v-text-field v-model="telefono" label="Teléfono">
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex cols="12" sm="6" md="6">
                                        <v-text-field v-model="email" label="Email">
                                        </v-text-field>
                                    </v-flex>
                                    <v-flex cols="12" sm="6" md="6">
                                        <v-text-field type="password" v-model="password" label="Password">
                                        </v-text-field>
                                    </v-flex>
                                    <v-col cols="12" sm="12" md="12" v-show="valida">
                                        <div class="red--text" v-for="v in validaMensaje" :key="v" v-text="v">
                                        </div>
                                    </v-col> 
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" text @click="close">Cancelar</v-btn>
                            <v-btn color="blue darken-1" text @click="guardar">Guardar</v-btn>
                        </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="adModal" max-width="390">
                        <v-card>
                            <v-card-title class="headline" v-if="adAccion==1">¿Activar Concepto de Banco?</v-card-title>
                            <v-card-title class="headline" v-if="adAccion==2">Bloquear Concepto de Banco?</v-card-title>
                            <v-card-text>
                                Estás a punto de 
                                <span v-if="adAccion==1">Activar </span>
                                <span v-if="adAccion==2">Bloquear </span>
                                el Concepto de Banco: {{ adNombre }}
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer/>
                                <v-btn small @click="activarDesactivarCerrar">Cancel
                                <v-icon>cancel</v-icon>
                                </v-btn>
                                <v-btn small v-if="adAccion==1" @click="activar">Activar
                                <v-icon>lock_open</v-icon>
                                </v-btn>
                                <v-btn small v-if="adAccion==2" @click="desactivar">Bloquear
                                <v-icon>lock</v-icon>
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item }">
                <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
                >
                edit
                </v-icon>
                <v-icon
                small
                @click="deleteItem(item)"
                >
                delete
                </v-icon>
                    <template v-if="item.activo">
                        <v-icon
                        small
                        @click="activarDesactivarMostrar(2,item)"
                        >
                        block
                        </v-icon>
                    </template>
                    <template v-else>
                        <v-icon
                        small
                        @click="activarDesactivarMostrar(1,item)"
                        >
                        check
                        </v-icon>
                </template>
            </template>
            <template v-slot:item.activo="{ item }">
                <td>
                    <div v-if="item">
                        <span class="blue--text">Activo</span>
                    </div>
                    <div v-else>
                        <span class="red--text">Inactivo</span>
                    </div>
                </td>
            </template>
            <template v-slot:item.fecalta="{ item }">
                <td>{{ item.fecalta.substr(0, 16) }}</td>
            </template>
            <template v-slot:item.fecumod="{ item }">
                <td>{{ item.fecumod.substr(0, 16) }}</td>
            </template>
            <template v-slot:no-data>
                <v-btn color="primary" @click="listar">Resetear</v-btn>
            </template>
            </v-data-table>

        </v-col>
    </v-row>
</template>
<script>
  import axios from 'axios'
  import jsPDF from 'jspdf'
  import autoTable from 'jspdf-autotable';
  export default {
    data: () => ({
        snackbar:false,
        snacktext: '',
        timeout: 4000,
        usuarios: [],
        roles:[],
        personas: [],
        dialog: false,
        headers: [
            { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
            { text: 'Userid', value: 'userid', align: 'start', sortable: true },
            { text: 'Rol', value: 'rol', align: 'start', sortable: true },
            { text: 'Id Persona', value: 'personaId', align: 'start', sortable: true },                    
            { text: 'Teléfono', value: 'telefono', align: 'start', sortable: true },
            { text: 'Estado', value: 'activo', align: 'center', sortable: true  },
            { text: 'Creador Id', value: 'iduseralta', align: 'center', sortable: true },
            { text: 'Fecha Hora Creación', value: 'fecalta', align: 'start', sortable: true },
            { text: 'Mod. Id', value: 'iduserumod', align: 'center', sortable: true },
            { text: 'Fecha Hora Ult.Mod.', value: 'fecumod', align: 'start', sortable: true }                   
        ],
        search:'',
        searchpe:'',
        editedIndex: -1,
        id: '',
        rolId:'',
        personaId:null,
        userid:'',
        telefono: '',
        email: '',
        password:'',
        iduseralta:'',
        fecalta:'',
        iduserumod:'',
        fecumod:'',
        activo:false,           
        actPassword:false,
        passwordAnt:'',
        valida: 0,
        validaMensaje:[],
        adModal: 0,
        adAccion: 0,
        adNombre: '',
        adId: ''             
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nuevo usuario' : 'Actualizar usuario'
      },
    },

    watch: {
        dialog (val) {
            val || this.close()
        },
    },

    created () {
        this.select();
        this.listar()
    },

    methods: {
        crearPDF(){
            var columns = [
                    {title: "UserId", dataKey: "userid"},
                    {title: "Rol", dataKey: "rol"},
                    {title: "Telefono", dataKey: "telefono"},
                    {title: "Activo", dataKey: "activo"}
            ];
            var rows = [];

            this.usuarios.map(function(x){
                    rows.push({userid:x.userid,rol:x.rol,telefono:x.telefono,activo:x.activo});
            });

            // Only pt supported (not mm or in)
            var doc = new jsPDF('l', 'pt');
            doc.autoTable(columns, rows, {
                margin: {top: 60},
                addPageContent: function(data) {
                    doc.text("Listado de Usuarios", 40, 30);
                }
            });
            doc.save('Usuarios.pdf');
        },
        listar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.get('api/Usuarios/Listar',configuracion).then(function(response){
                //console.log(response);
                me.usuarios=response.data;
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
            select(){
                let me=this;
                var rolesArray=[];
                var personasArray=[];
                let header={"Authorization" : "Bearer " + this.$store.state.token};
                let configuracion= {headers : header};
                axios.get('api/Roles/Select',configuracion).then(function(response){
                    rolesArray=response.data;
                    rolesArray.map(function(x){
                        me.roles.push({text: x.nombre,value:x.id});
                    });
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
                axios.get('api/Personas/Select',configuracion)
                .then(function(response){
                    personasArray=response.data;
                    personasArray.map(function(x){
                        me.personas.push({text: x.nombre,value:x.personaId});
                    });
                }).catch(function(error){
                    if (!error.response.status==500){
                        me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                        me.snackbar = true;
                        console.log(error);
                    }
                });                
            },
        editItem (item) {
            this.id=item.id;
            this.rolId=item.rolId;
            this.personaId=item.personaId;
            this.userid=item.userid;
            this.telefono=item.telefono;
            this.email=item.email;
            this.password=item.password_hash;
            this.passwordAnt=item.password_hash;
            this.iduseralta=item.iduseralta;
            this.fecalta=item.fecalta;
            this.iduserumod=item.iduserumod;
            this.fecumod=item.fecumod;
            this.activo=item.activo;
            this.editedIndex=1;
            this.dialog = true
        },
        deleteItem (item) {
            var resulta = confirm('Esta seguro de querer borrar el registro?');
            if (result) {
                let header={"Authorization" : "Bearer " + this.$store.state.token};
                let configuracion= {headers : header};
                axios.delete('api/Usuarios/Eliminar/'+item.id,configuracion).then(function(response){
                    me.close();
                        me.listar();
                        me.limpiar();
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            }
        },
        close () {
            this.dialog = false
            this.limpiar();

        },
        limpiar(){
                this.id="";
                this.rolId="";
                this.personaId=null;
                this.userid="";
                this.telefono="";
                this.email="";
                this.password="";
                this.passwordAnt="";
                this.iduseralta = "";
                this.fecalta = "";
                this.iduserumod = "";
                this.fecumod = "";
                this.activo = false;          
                this.actPassword=false;
                this.editedIndex=-1;
        },
        guardar () {
            if (this.validar()){
                return;
            }
            var date = new Date();                
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            if (this.editedIndex > -1) {
                //Código para editar
                //Código para guardar
                let me=this;
                if (me.password!=me.passwordAnt){
                    me.actPassword=true;
                }
                axios.put('api/Usuarios/Actualizar',{
                    'Id':me.id,
                    'rolId':me.rolId,
                    'personaId':me.personaId,
                    'userid':me.userid,
                    'telefono': me.telefono,
                    'email':me.email,
                    'password':me.password,
                    'act_password':me.actPassword,
                    'iduseralta': me.iduseralta,
                    'fecalta': me.fecalta,
                    'iduserumod': me.$store.state.usuario.idusuario,
                    'fecumod': new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString()                                            
                },configuracion).then(function(response){
                    me.close();
                    me.listar();
                    me.limpiar();                        
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            } else {
                //Código para guardar
                let me=this;
                axios.post('api/Usuarios/Crear',{
                    'rolId':me.rolId,
                    'personaId':me.personaId,
                    'userid':me.userid,
                    'telefono': me.telefono,
                    'email':me.email,
                    'password':me.password,
                    'iduseralta': me.$store.state.usuario.idusuario                      
                },configuracion)
                .then(function(response){
                    console.log(response);
                    me.close();
                    me.listar();
                    me.limpiar();                        
                }).catch(function(error){
                    me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                    me.snackbar = true;
                    console.log(error);
                });
            }
        },
        validar(){
            this.valida=0;
            this.validaMensaje=[];

            if (this.userid.length<3 || this.userid.length>100){
                this.validaMensaje.push("El nombre debe tener más de 3 caracteres y menos de 100 caracteres.");
            }
            if (!this.rolId){
                this.validaMensaje.push("Seleccione un rol.");
            }
            if (!this.email){
                this.validaMensaje.push("Ingrese el email del usuario.");
            }
            if (!this.password){
                this.validaMensaje.push("Ingrese el password del usuario.");
            }
            if (this.validaMensaje.length){
                this.valida=1;
            }
            return this.valida;
        },
        activarDesactivarMostrar(accion,item){
            this.adModal=1;
            this.adNombre=item.userid;
            this.adId=item.id;                
            if (accion==1){
                this.adAccion=1;
            }
            else if (accion==2){
                this.adAccion=2;
            }
            else{
                this.adModal=0;
            }
        },
        activarDesactivarCerrar(){
            this.adModal=0;
        },
        activar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.put('api/Usuarios/Activar/'+this.adId,{},configuracion).then(function(response){
                me.adModal=0;
                me.adAccion=0;
                me.adNombre="";
                me.adId="";
                me.listar();                       
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        desactivar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};

            axios.put('api/Usuarios/Desactivar/'+this.adId,{},configuracion).then(function(response){
                me.adModal=0;
                me.adAccion=0;
                me.adNombre="";
                me.adId="";
                me.listar();                       
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        }
    },
  }
</script>
