<template>
    <v-row align="start">
        <v-col>
            <v-data-table
            :headers="headers"
            :items="conbancos"
            :search="search"
            class="elevation-1"
            no-data-text="Nada para mostrar"
            >
            <template v-slot:top>
                <v-toolbar flat color="white">
                    <div class="ma-2">
                        <v-btn small @click="crearPDF()"><v-icon>print</v-icon></v-btn>
                    </div>
                    <v-toolbar-title>Conceptos Bancarios</v-toolbar-title>
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
                                    <v-col cols="12" sm="4" md="4">
                                        <v-autocomplete 
                                            v-model="empresaId"
                                            clearable
                                            :items = "empresas"
                                            :search-input.sync="searchem"
                                            @change="selectGrpconceptos()"                                   
                                            label="Empresa">
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" sm="8" md="8">
                                        <v-autocomplete 
                                            v-model="grpconceptoId"
                                            clearable
                                            :items = "grpconceptos"
                                            :search-input.sync="searchco"                                   
                                            label="Grupo de Conceptos">
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="12">
                                        <v-autocomplete 
                                            v-model="bancoId"
                                            clearable
                                            :items = "bancos"
                                            :search-input.sync="searchba"                                   
                                            label="Banco">
                                        </v-autocomplete>
                                    </v-col>                            
                                    <v-col cols="12" sm="4" md="4">
                                        <v-text-field v-model="orden" label="Código">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="8" md="8">
                                        <v-text-field v-model="nombre" label="Nombre del Concepto">
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
        conbancos: [],
        empresas: [],
        bancos: [],
        grpconceptos: [],
        dialog: false,
        headers: [
            { text: '[Opciones]', value: 'actions', align: 'center', sortable: false },
            { text: 'Empresa', value: 'empresa', align: 'start', sortable: true },
            { text: 'Grupo de Concepto', value: 'grpconcepto', align: 'start', sortable: true },
            { text: 'Entidad Bancaria', value: 'banco', align: 'start', sortable: true },                    
            { text: 'Código', value: 'orden', align: 'start', sortable: true },
            { text: 'Nombre del Concepto', value: 'nombre', align: 'start', sortable: true },
            { text: 'Estado', value: 'activo', align: 'center', sortable: true  },
            { text: 'Creador Id', value: 'iduseralta', align: 'center', sortable: true },
            { text: 'Fecha Hora Creación', value: 'fecalta', align: 'start', sortable: true },
            { text: 'Mod. Id', value: 'iduserumod', align: 'center', sortable: true },
            { text: 'Fecha Hora Ult.Mod.', value: 'fecumod', align: 'start', sortable: true }                  
        ],
        search:'',
        searchem: '',
        searchco: '',
        searchba: '',
        editedIndex: -1,
        id: '',
        empresaId: '',
        empresa: '',
        grpconceptoId: '',
        grpconcepto: '',
        bancoId: '',
        banco:'',
        orden: '',
        nombre: '',
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
        return this.editedIndex === -1 ? 'Nuevo Concepto Bancario' : 'Actualizar Concepto Bancario'
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
                    {title: "Empresa", dataKey: "empresa"},
                    {title: "Grupo", dataKey: "grpconcepto"},
                    {title: "Orden", dataKey: "orden"},
                    {title: "Concepto", dataKey: "nombre"},
                    {title: "Activo", dataKey: "activo"}
            ];
            var rows = [];

            this.conbancos.map(function(x){
                    rows.push({nombre:x.nombre,empresaId:x.empresaId,empresa:x.empresa,orden:x.orden,grpconcepto:x.grpconcepto,activo:x.activo});
            });

            // Only pt supported (not mm or in)
            var doc = new jsPDF('l', 'pt');
            doc.autoTable(columns, rows, {
                margin: {top: 60},
                addPageContent: function(data) {
                    doc.text("Listado de Conceptos Bancarios", 40, 30);
                }
            });
            doc.save('Concbanco.pdf');
        },
        listar(){
            let me=this;
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            // console.log(configuracion);
            axios.get('api/Conbancos/Listar',configuracion).then(function(response){
                // console.log(response);
                me.conbancos=response.data;
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        select(){
            let me=this;
            var empresasArray=[];
            var bancosArray=[];
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.get('api/Empresas/Select',configuracion).then(function(response){
                // console.log(response);
                empresasArray=response.data;
                empresasArray.map(function(x){
                    me.empresas.push({text: x.nombre,value:x.id});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
            axios.get('api/Bancos/Select',configuracion).then(function(response){
                // console.log(response);
                empresasArray=response.data;
                empresasArray.map(function(x){
                    me.bancos.push({text: x.nombre,value:x.id});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },
        selectGrpconceptos(){
            let me=this;
            var grpconceptosArray=[];
            let header={"Authorization" : "Bearer " + this.$store.state.token};
            let configuracion= {headers : header};
            axios.get('api/Grpconceptos/SelectGrpconceptoDeEmpresa/'+me.empresaId,configuracion).then(function(response){
                // console.log(response);
                grpconceptosArray=response.data;
                grpconceptosArray.map(function(x){
                    me.grpconceptos.push({text: x.nombre,value:x.id});
                });
            }).catch(function(error){
                me.snacktext = 'Se detectó un error. Código: '+ error.response.status;
                me.snackbar = true;
                console.log(error);
            });
        },                        
        editItem (item) {
                this.id=item.id;
                this.empresaId=item.empresaId;
                this.selectGrpconceptos();
                this.orden=item.orden;
                this.nombre=item.nombre;
                this.grpconceptoId=item.grpconceptoId;
                this.grpconcepto=item.grpconcepto;
                this.bancoId=item.bancoId;
                this.banco=item.banco;
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
                axios.delete('api/Conbancos/Eliminar/'+item.id,configuracion).then(function(response){
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
            this.empresaId="";
            this.orden="";
            this.nombre="";
            this.grpconceptoId="";
            this.grpconcepto="";
            this.bancoId="";
            this.banco="";
            this.iduseralta = "";
            this.fecalta = "";
            this.iduserumod = "";
            this.fecumod = "";
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
                axios.put('api/Conbancos/Actualizar',{
                    'Id':me.id,
                    'empresaId': me.empresaId,
                    'bancoId': me.bancoId,
                    'orden': me.orden,
                    'nombre': me.nombre,
                    'grpconceptoId': me.grpconceptoId,
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
                axios.post('api/Conbancos/Crear',{
                    'empresaId': me.empresaId,
                    'bancoId': me.bancoId,
                    'orden': me.orden,
                    'nombre': me.nombre,
                    'grpconceptoId': me.grpconceptoId,
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
                this.validaMensaje.push("El Nombre debe tener más de 3 caracteres y menos de 50 caracteres.");
            }
            if (!this.empresaId){
                this.validaMensaje.push("Seleccione una Empresa.");
            }
            if (!this.orden){
                this.validaMensaje.push("Indique un código.");
            }
            if (this.orden.length>3){
                this.validaMensaje.push("El código debe tener 3 o menos caracteres.");
            }
            if (!this.grpconceptoId){
                this.validaMensaje.push("Seleccione un Grupo de Conceptos.");
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
            axios.put('api/Conbancos/Activar/'+this.adId,{},configuracion).then(function(response){
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
            axios.put('api/Conbancos/Desactivar/'+this.adId,{},configuracion).then(function(response){
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
