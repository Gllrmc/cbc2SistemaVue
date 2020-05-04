<template>
    <v-row align="start">
        <v-col>
            <v-data-table
            :headers="headers"
            :items="empresas"
            :search="search"
            class="elevation-1"
            no-data-text="Nada para mostrar"
            >
            <template v-slot:top>
                <v-toolbar flat color="white">
                    <div class="ma-2">
                        <v-btn small @click="crearPDF()"><v-icon>print</v-icon></v-btn>
                    </div>
                    <v-toolbar-title>Empresas</v-toolbar-title>
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
                                    <v-col cols="12" sm="9" md="9">
                                        <v-text-field v-model="nombre" label="Empresa">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field v-model="cuit" label="CUIT">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="9" md="9">
                                        <v-text-field v-model="direccion" label="Dirección">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field v-model="localidad" label="Localidad">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="5" md="5">
                                        <v-autocomplete 
                                            v-model="paisId"
                                            clearable
                                            :items = "paises"
                                            :search-input.sync="searchpa"
                                            @change="filterProvincias()"
                                            label = "País">
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" sm="5" md="5">
                                        <v-autocomplete 
                                            v-model="provinciaId"
                                            clearable
                                            :items = "provinciasf" 
                                            :search-input.sync="searchpr"                                    
                                            @change="asignaPais()"                                   
                                            label = "Provincia">
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" sm="2" md="2">
                                        <v-text-field v-model="cpostal" label="C.P.">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="4" md="4">
                                        <v-text-field v-model="telefono" label="telefono">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="4" md="4">
                                        <v-text-field v-model="email" label="eMail">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="4" md="4">
                                        <v-text-field v-model="webpage" label="Web Page">
                                        </v-text-field>
                                    </v-col>
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
                    <div v-if="item.activo">
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
                empresas:[],
                paises: [],
                provincias: [],               
                provinciasf: [],               

        empresas: [],
        roles:[],
        personas: [],

        dialog: false,
        headers: [
            { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
            { text: 'Razon Social', value: 'nombre', align: 'start', sortable: true },
            { text: 'CUIT', value: 'cuit', align: 'start', sortable: true },
            { text: 'Direccion', value: 'direccion', align: 'start', sortable: true },
            { text: 'Localidad', value: 'localidad', align: 'start', sortable: true },
            { text: 'C.P.', value: 'cpostal', align: 'start', sortable: true },
            { text: 'Provincia', value: 'provincia', align: 'start', sortable: true  },
            { text: 'Pais', value: 'pais', align: 'start', sortable: true  },
            { text: 'Telefono', value: 'telefono', align: 'start', sortable: true  },
            { text: 'eMail', value: 'email', align: 'start', sortable: true  },
            { text: 'Web Page', value: 'webpage', align: 'start', sortable: true  },
            { text: 'Teléfono', value: 'telefono', align: 'start', sortable: true },
            { text: 'Estado', value: 'activo', align: 'center', sortable: true  },
            { text: 'Creador Id', value: 'iduseralta', align: 'center', sortable: true },
            { text: 'Fecha Hora Creación', value: 'fecalta', align: 'start', sortable: true },
            { text: 'Mod. Id', value: 'iduserumod', align: 'center', sortable: true },
            { text: 'Fecha Hora Ult.Mod.', value: 'fecumod', align: 'start', sortable: true }                   
        ],
        search: '',
        searchpa: '',
        searchpr: '',
        editedIndex: -1,
        id: '',
        paisId:'',
        provinciaId:'',
        nombre: '',
        cuit: '',
        direccion: '',
        localidad: '',
        cpostal:'',
        email: '',
        telefono: '',
        webpage: '',
        iduseralta:'',
        fecalta:'',
        iduserumod:'',
        fecumod:'',
        activo:false,
        valida: 0,
        validaMensaje:[],
        adModal: 0,
        adAccion: 0,
        adNombre: '',
        adId: ''             
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Nueva empresa' : 'Actualizar empresa'
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
                    {title: "Razon Social", dataKey: "nombre"},
                    {title: "CUIT", dataKey: "cuit"},
                    {title: "Dirección", dataKey: "direccion"}, 
                    {title: "Localidad", dataKey: "localidad"}, 
                    {title: "C.P.", dataKey: "cpostal"},
                    {title: "Provincia", dataKey: "provincia"}, 
                    {title: "Pais", dataKey: "pais"}, 
                    {title: "Teléfono", dataKey: "telefono"}, 
                    {title: "eMail", dataKey: "email"}, 
                    {title: "Web Page", dataKey: "webpage"},
                    {title: "Activo", dataKey: "activo"}
            ];
            var rows = [];

            this.empresas.map(function(x){
                    rows.push({nombre:x.nombre,cuit:x.cuit,direccion:x.direccion,localidad:x.localidad,cpostal:x.cpostal,provincia:x.provincia,pais:x.pais,
                    telefono:x.telefono,email:x.email,webpage:x.webpage,activo:x.activo});
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
            axios.get('api/Empresas/Listar',configuracion).then(function(response){
                //console.log(response);
                me.empresas=response.data;
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        select(){
            let me=this;
            var paisesArray=[];
            var provinciasArray=[];
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.get('api/Paises/Select',configuracion).then(function(response){
                // console.log(response);
                paisesArray=response.data;
                paisesArray.map(function(x){
                    me.paises.push({text: x.nombre,value:x.id});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
            axios.get('api/Provincias/Select',configuracion).then(function(response){
                // console.log(response);
                provinciasArray=response.data;
                provinciasArray.map(function(x){
                    me.provincias.push({text: x.nombre,value:x.id, pais: x.paisId});
                    me.provinciasf=me.provincias;
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        asignaPais(){
            var ii = this.provincias.findIndex(p => p.value === this.provinciaId);
            this.paisId = this.provincias[ii].pais;
        },
        filterProvincias(){
            this.provinciasf = this.provincias.filter(x => x.pais === this.paisId);
            if (provinciaId) {
                var ii = this.provincias.findIndex(p => p.value === this.provinciaId);
                if (!this.paisId === this.provincias[ii].pais){
                    this.provinciaId="";
                }
            }
        },
        editItem (item) {
            this.id=item.id;
            this.provinciaId=item.provinciaId;
            this.paisId=item.paisId;
            this.nombre=item.nombre;
            this.cuit=item.cuit;
            this.direccion=item.direccion;
            this.localidad=item.localidad;
            this.cpostal=item.cpostal;
            this.telefono=item.telefono;
            this.email=item.email;
            this.webpage=item.webpage;
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
                axios.delete('api/Empresas/Eliminar/'+item.id,configuracion).then(function(response){
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
            this.provinciasf=this.provincias;
            this.id="";
            this.paisId="";
            this.provinciaId="";
            this.nombre="";
            this.cuit="";
            this.direccion="";
            this.localidad="";
            this.telefono="";
            this.email="";
            this.webpage="";
            this.iduseralta = "";
            this.fecalta = "";
            this.iduserumod = "";
            this.fecumod = "";
            this.activo = false;                  
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
                axios.put('api/Empresas/Actualizar',{
                    'Id':me.id,
                    'paisId':me.paisId,
                    'provinciaId':me.provinciaId,
                    'nombre': me.nombre,
                    'cuit': me.cuit,
                    'direccion': me.direccion,
                    'localidad': me.localidad,
                    'cpostal': me.cpostal,
                    'telefono': me.telefono,
                    'email': me.email,
                    'webpage': me.webpage,
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
                axios.post('api/Empresas/Crear',{
                    'paisId':me.paisId,
                    'provinciaId':me.provinciaId,
                    'nombre': me.nombre,
                    'cuit': me.cuit,
                    'direccion': me.direccion,
                    'localidad': me.localidad,
                    'cpostal': me.cpostal,
                    'telefono': me.telefono,
                    'email': me.email,
                    'webpage': me.webpage,
                    'iduseralta': me.$store.state.usuario.idusuario                           
                },configuracion).then(function(response){
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

            if (this.nombre.length<3 || this.nombre.length>50){
                this.validaMensaje.push("La empresa debe tener más de 3 caracteres y menos de 50 caracteres.");
            }
            if (!this.paisId){
                this.validaMensaje.push("Seleccione un país.");
            }
            if (!this.provinciaId){
                this.validaMensaje.push("Seleccione una provincia.");
            }
            if (this.validaMensaje.length){
                this.valida=1;
            }
            return this.valida;
        },
        activarDesactivarMostrar(accion,item){
            this.adModal=1;
            this.adNombre=item.nombre;
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
            axios.put('api/Empresas/Activar/'+this.adId,{},configuracion).then(function(response){
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
            axios.put('api/Empresas/Desactivar/'+this.adId,{},configuracion).then(function(response){
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
