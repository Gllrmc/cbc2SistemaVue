<template>
    <v-row align="start">
        <v-col>
            <v-data-table
            :headers="headers"
            :items="bancos"
            :search="search"
            class="elevation-1"
            no-data-text="Nada para mostrar"
            >
            <template v-slot:top>
                <v-toolbar flat color="white">
                    <div class="ma-2">
                        <v-btn small @click="crearPDF()"><v-icon>print</v-icon></v-btn>
                    </div>
                    <v-toolbar-title>Bancos</v-toolbar-title>
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
                                    <v-col cols="12" sm="8" md="8">
                                    <v-text-field v-model="nombre" label="Banco"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="2" md="2">
                                    <v-text-field v-model="nombrecorto" label="Siglas"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="2" md="2">
                                    <v-text-field v-model="codigoBCRA" label="Código BCRA"></v-text-field>
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
                    <v-dialog v-model="adModal" max-width="290">
                        <v-card>
                            <v-card-title class="headline" v-if="adAccion==1">¿Activar Banco?</v-card-title>
                            <v-card-title class="headline" v-if="adAccion==2">Bloquear Banco?</v-card-title>
                            <v-card-text>
                                Estás a punto de 
                                <span v-if="adAccion==1">Activar </span>
                                <span v-if="adAccion==2">Bloquear </span>
                                el Banco {{ adNombre }}
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
            <template v-slot:[`item.actions`]="{ item }">
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
            <template v-slot:[`item.activo`]="{ item }">
                <td>
                    <div v-if="item.activo">
                        <span class="blue--text">Activo</span>
                    </div>
                    <div v-else>
                        <span class="red--text">Inactivo</span>
                    </div>
                </td>
            </template>
            <template v-slot:[`item.fecalta`]="{ item }">
                <td>{{ item.fecalta.substr(0, 16) }}</td>
            </template>
            <template v-slot:[`item.fecumod`]="{ item }">
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
        bancos: [],
        dialog: false,
        headers: [
            { text: '[Opciones]', value: 'actions', align: 'start', sortable: false },
            { text: 'Denominacion', value: 'nombre', align: 'start', sortable: true },
            { text: 'Siglas', value: 'nombrecorto', align: 'center', sortable: true },
            { text: 'Codigo BCRA', value: 'codigoBCRA', align: 'center', sortable: true },
            { text: 'Estado', value: 'activo', align: 'center', sortable: true  },
            { text: 'Creador Id', value: 'iduseralta', sortable: true },
            { text: 'Fecha Hora Creación', value: 'fecalta', sortable: true },
            { text: 'Mod. Id', value: 'iduserumod', sortable: true },
            { text: 'Fecha Hora Ult.Mod.', value: 'fecumod', sortable: true }                   
        ],
        search:'',
        editedIndex: -1,
        id: '',
        nombre: '',
        nombrecorto: '',
        codigoBCRA: '',
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
        return this.editedIndex === -1 ? 'Nuevo Banco' : 'Actualizar Banco'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
    },

    created () {
      this.listar()
    },

    methods: {
        crearPDF(){
            var columns = [
                {title: "Razon Social", dataKey: "nombre"},
                {title: "Siglas", dataKey: "nombrecorto"},
                {title: "Codigo BCRA", dataKey: "codigoBCRA"},
                {title: "Activo", dataKey: "activo"}
            ];
            var rows = [];

            this.bancos.map(function(x){
                rows.push({nombre:x.nombre,nombrecorto:x.nombrecorto,codigoBCRA:x.codigoBCRA,activo:x.activo});
            });

            // Only pt supported (not mm or in)
            var doc = new jsPDF('l', 'pt');
            doc.autoTable(columns, rows, {
                margin: {top: 60},
                addPageContent: function(data) {
                    doc.text("Listado de Bancos", 40, 30);
                }
            });
            doc.save('Bancos.pdf');
        },
        listar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            // console.log(configuracion);
            axios.get('api/Bancos/Listar',configuracion).then(function(response){
                // console.log(response);
                me.bancos=response.data;
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },

        editItem (item) {
                this.id=item.id;
                this.nombre=item.nombre;
                this.nombrecorto=item.nombrecorto;
                this.codigoBCRA=item.codigoBCRA;
                this.iduseralta=item.iduseralta;
                this.fecalta=item.fecalta;
                this.iduserumod=item.iduserumod;
                this.fecumod=item.fecumod;
                this.activo=item.activo;                
                this.editedIndex=1;
                this.dialog = true
        },
        deleteItem (item) {
            var me=this;
            var resulta = confirm('Esta seguro de querer borrar el registro?');
            if (resulta) {
                let header={"Authorization" : "Bearer " + me.$store.state.token};
                let configuracion= {headers : header};
                axios.delete('api/Bancos/Eliminar/'+item.id,configuracion).then(function(response){
                    me.close();
                    me.listar();
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
            this.nombre="";
            this.nombrecorto="";
            this.codigoBCRA="";
            this.iduseralta = "";
            this.fecalta = "";
            this.iduserumod = "";
            this.fecumod = "";
            this.activo = false;                  
            this.editedIndex=-1;
        },
        guardar () {
            let me=this;
            if (me.validar()){
                return;
            }
            var date = new Date();                
            let header={"Authorization" : "Bearer " + me.$store.state.token};
            let configuracion= {headers : header};
            if (me.editedIndex > -1) {
                //Código para editar
                //Código para guardar
                axios.put('api/Bancos/Actualizar',{
                    'Id':me.id,
                    'nombre': me.nombre,
                    'nombrecorto': me.nombrecorto,
                    'codigoBCRA': me.codigoBCRA,
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
                axios.post('api/Bancos/Crear',{
                    'nombre': me.nombre,
                    'nombrecorto': me.nombrecorto,
                    'codigoBCRA': me.codigoBCRA,
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
                this.validaMensaje.push("El Banco debe tener más de 3 caracteres y menos de 50 caracteres.");
            }
            if (this.nombrecorto.length<3 || this.nombrecorto.length>3){
                this.validaMensaje.push("la sigla debe tener 3 caracteres.");
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
            axios.put('api/Bancos/Activar/'+this.adId,{},configuracion).then(function(response){
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
            axios.put('api/Bancos/Desactivar/'+this.adId,{},configuracion).then(function(response){
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
